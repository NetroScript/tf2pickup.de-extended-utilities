import type { PageServerLoad, Actions } from './$types';
import { steamAPI } from '$lib/server/steamapi';
import prisma from '$lib/server/database/prisma';
import { upsertUser } from '$lib/server/database/user';
import { eventHandlers } from '../../lib/server/events';
import type { UserWithSteamProfile } from '../../lib/server/database/user';
import { discordClient } from '../../hooks.server';

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

    let steamUser: UserWithSteamProfile | null = null;

    if (typeof userURL === 'string' && userURL.length > 0) {
      // Resolve the user URL to a SteamID (any input allowed)
      try {
        const steamIDResolved = await steamAPI.resolve(userURL);

        console.log('Resolved user URL to SteamID: ', steamIDResolved);

        // Check if a user already exists with this SteamID
        const user = await prisma.user.findUnique({
          where: {
            steamId: BigInt(steamIDResolved)
          },
          include: {
            steamProfile: true
          }
        });

        if (!user) {
          // Create a new user account
          steamUser = await upsertUser(await steamAPI.getUserSummary(steamIDResolved));
        } else {
          steamUser = user;
        }
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
          currency: 'EUR',
          original_JSON: '',
          message_id: '',
          is_first_subscription_payment: false,
          is_subscription_payment: false,
          kofi_transaction_id: '',
          UserKOFIDonation: steamUser
            ? {
                create: {
                  userId: BigInt(steamUser.steamId)
                }
              }
            : undefined
        }
      });
    } catch (e) {
      return { insertCustomDonation: { success: false, error: 'Failed to insert donation into the database' } };
      console.log('Failed to insert donation into the database: ', e);
    }
    eventHandlers.newDonationEvt.post({
      steamUser,
      donation: {
        verification_token: 'MANUAL_INSERT_ADMIN_API',
        message: message.length > 0 ? message : null,
        message_id: '',
        amount: amount.toString(),
        currency: 'EUR',
        email: '',
        from_name: displayName,
        is_first_subscription_payment: false,
        is_public: true,
        is_subscription_payment: false,
        kofi_transaction_id: '',
        shipping: null,
        shop_items: null,
        tier_name: null,
        timestamp: new Date().toISOString(),
        type: 'Donation',
        url: ''
      }
    });

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
  },
  updateDiscordSlashCommands: async ({ cookies, request }) => {
    try {
      await discordClient.registerSlashCommands();

      return { updateDiscordSlashCommands: { success: true } };
    } catch (e) {
      console.log('Failed to update Discord slash commands: ', e);
      return { updateDiscordSlashCommands: { success: false, error: 'Failed to update Discord slash commands' } };
    }
  }
} satisfies Actions;
