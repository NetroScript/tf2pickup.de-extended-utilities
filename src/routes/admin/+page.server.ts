import type { PageServerLoad, Actions } from './$types';
import { steamAPI } from '$lib/steamapi';
import prisma from '$lib/database/prisma';
import { upsertUser } from '$lib/database/user';

export const actions = {
  createUserAccount: async ({ cookies, request }) => {
    const data = await request.formData();
    const userURL = data.get('userURL');

    if (typeof userURL !== 'string') {
      return {
        createUserAccount: { success: false, error: 'Invalid user URL' }
      };
    }

    // Resolve the user URL to a SteamID (any input allowed)
    try {
      const steamID = await steamAPI.resolve(userURL);

      // Check if a user already exists with this SteamID
      const user = await prisma.user.findUnique({
        where: {
          steamId: BigInt(steamID)
        }
      });

      if (user) {
        return { createUserAccount: { success: true } };
      }

      // Create a new user account
      await upsertUser(await steamAPI.getUserSummary(steamID));
    } catch (error) {
      return { createUserAccount: { success: false, error: 'Invalid Steam User' } };
    }

    return { createUserAccount: { success: true } };
  },
  insertCustomDonation: async ({ cookies, request }) => {
    const data = await request.formData();

    // Reject if any file is uploaded
    for (const [key, value] of data.entries()) {
      if (!value || typeof value === 'string') continue;

      return {
        insertCustomDonation: {
          success: false,
          error: 'This API does not support file uploads'
        }
      };
    }
    // Check that amount is a valid number
    if (isNaN(Number((data.get('amount') ?? '') as string))) {
      return {
        insertCustomDonation: {
          success: false,
          error: 'Invalid amount'
        }
      };
    }

    const userURL = (data.get('userURL') ?? '') as string;
    const amount = Number((data.get('amount') ?? '') as string);
    const message = (data.get('message') ?? '') as string;
    const displayName = (data.get('displayName') ?? 'Anonymous') as string;

    // If the amount is 0, don't insert the donation
    if (amount === 0) {
      return {
        insertCustomDonation: {
          success: false,
          error: 'Amount must be greater than 0'
        }
      };
    }

    console.log('Creating custom donation: ', userURL, amount, message, displayName);

    let steamID = null;

    if (typeof userURL === 'string' && userURL.length > 0) {
      // Resolve the user URL to a SteamID (any input allowed)
      try {
        const steamIDResolved = await steamAPI.resolve(userURL);

        console.log('Resolved user URL to SteamID: ', steamIDResolved);

        // Check if a user already exists with this SteamID
        const user = await prisma.user.findUnique({
          where: {
            steamId: BigInt(steamIDResolved)
          }
        });

        if (!user) {
          // Create a new user account
          await upsertUser(await steamAPI.getUserSummary(steamIDResolved));
        }

        steamID = steamIDResolved;
      } catch (error) {
        console.log('Failed to resolve user URL: ', error);
      }
    }

    try {
      // Insert the donation into the database
      await prisma.kOFIDonation.create({
        data: {
          manually_created: true,
          verification_token: 'MANUAL_INSERT_ADMIN_API',
          message: message.length > 0 ? message : null,
          amount,
          from_name: displayName,
          type: 'Donation',
          timestamp: new Date(),
          is_public: true,
          url: '',
          email: '',
          currency: 'EURO',
          original_JSON: '',
          message_id: '',
          is_first_subscription_payment: false,
          is_subscription_payment: false,
          kofi_transaction_id: '',
          UserKOFIDonation: steamID
            ? {
                create: {
                  userId: BigInt(steamID)
                }
              }
            : undefined
        }
      });
    } catch (e) {
      return { insertCustomDonation: { success: false, error: 'Failed to insert donation into the database' } };
      console.log('Failed to insert donation into the database: ', e);
    }

    return { insertCustomDonation: { success: true } };
  },
  insertCustomPayment: async ({ cookies, request }) => {
    const data = await request.formData();

    // Check that amount is a valid number
    if (isNaN(Number((data.get('amount') ?? '') as string))) {
      return {
        insertCustomPayment: {
          success: false,
          error: 'Invalid amount'
        }
      };
    }

    const amount = Number((data.get('amount') ?? '') as string);
    const message = (data.get('message') ?? '') as string;

    // If the amount is 0, don't insert the cost
    if (amount === 0) {
      return {
        insertCustomPayment: {
          success: false,
          error: 'Amount must be greater than 0'
        }
      };
    }

    console.log('Creating custom cost: ', amount, message);

    // Insert the cost into the database
    await prisma.costTransaction.create({
      data: {
        amount,
        description: message
      }
    });

    return { insertCustomPayment: { success: true } };
  }
} satisfies Actions;
