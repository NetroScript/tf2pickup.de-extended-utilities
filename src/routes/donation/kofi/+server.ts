import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { KOFIDonationSchema } from '$types/Donation';
import { KOFI_VERIFICATION_TOKEN } from '$env/static/private';
import { steamAPI } from '../../../lib/server/steamapi';
import prisma from '../../../lib/server/database/prisma';
import { upsertUser, type UserWithSteamProfile } from '../../../lib/server/database/user';
import type { User } from '@prisma/client';
import { eventHandlers } from '../../../lib/server/events';
import { Prisma } from '@prisma/client';

export const POST: RequestHandler = (async ({ request }) => {
  try {
    const data = await request.json();

    // Data should also have a top level 'data' key
    if (!data.data) {
      return json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    // Now we use the zod object to validate the data
    try {
      const donation = KOFIDonationSchema.parse(data.data);

      // Check if the donation verification_token is the same we have setup locally
      if (donation.verification_token !== KOFI_VERIFICATION_TOKEN) {
        return json({ success: false, error: 'Invalid KO-FI Verification Token' }, { status: 400 });
      }

      // It is valid, so we can now process the donation

      // Save the following metadata to the database:
      let message = donation.message;
      let steamUser: UserWithSteamProfile | null = null;

      // First check if the donation has a message, which contains the user's Steam ID
      // If it does, we can use that to find / create the user, and remove the steam ID from the message later
      if (donation.message) {
        // Assume the Steam ID is the first part of the message, delimited by a space or newline
        const steamIDString = donation.message.split(/\s/)[0];

        // Silenty fail if the Steam ID is invalid
        try {
          // Try to resolvle the Steam ID to a user
          const steamID = await steamAPI.resolve(steamIDString);

          // We have a valid Steam ID, so we can remove it from the message
          message = donation.message.replace(steamIDString, '').trim();

          // Check if a user already exists with this SteamID
          steamUser = await prisma.user.findUnique({
            where: {
              steamId: BigInt(steamID)
            },
            include: {
              steamProfile: true
            }
          });

          // If the user does not exist, create it
          if (!steamUser) {
            steamUser = await upsertUser(await steamAPI.getUserSummary(steamID));
          }
        } catch (e) {
          /* empty */
        }
      }

      eventHandlers.newDonationEvt.post({ donation, steamUser });

      // Enter the donation into the database
      await prisma.kOFIDonation.create({
        data: {
          amount: Number(donation.amount),
          verification_token: donation.verification_token,
          message_id: donation.message_id,
          timestamp: new Date(donation.timestamp),
          type: donation.type,
          is_public: donation.is_public,
          from_name: donation.from_name ?? 'Anonymous',
          message: message === null ? null : message.length > 0 ? message : null,
          url: donation.url,
          email: donation.email,
          currency: donation.currency,
          is_subscription_payment: donation.is_subscription_payment,
          is_first_subscription_payment: donation.is_first_subscription_payment,
          kofi_transaction_id: donation.kofi_transaction_id,
          original_JSON: JSON.stringify(donation),
          UserKOFIDonation: steamUser ? { create: { userId: steamUser.steamId } } : undefined
        }
      });
    } catch (error) {
      // Check if error is a prism error
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientValidationError
      ) {
        console.log('Prisma Error during donation insertion:' + error.message);
        return json({ success: false, error: 'Database error' }, { status: 400 });
      }

      // Otherwise, it's a validation error
      // Log the error
      console.log('Validation Error during donation insertion:', error);

      return json({ success: false, error: 'Invalid KO-FI Data' }, { status: 400 });
    }
  } catch (error) {
    return json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  return json({ success: true });
}) satisfies RequestHandler;
