import type { PageServerLoad } from './$types';
import prisma from '../lib/database/prisma';

export const load = (async ({ params }) => {
  // Fetch all KOFI donations, and if there is a user associated with it, fetch the user
  const donations = await prisma.kOFIDonation.findMany({
    include: {
      UserKOFIDonation: {
        include: {
          user: {
            include: {
              steamProfile: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch all Costs
  const costs = await prisma.costTransaction.findMany({ orderBy: { createdAt: 'desc' } });

  // Map the donations to a new array
  const donationsMapped = donations.map((donation) => {
    return {
      time: donation.createdAt,
      display_name: donation.from_name,
      amount: donation.amount,
      currency: donation.currency,
      message: donation.message,
      steamUser:
        donation.UserKOFIDonation.length > 0
          ? {
              id: donation.UserKOFIDonation[0].user.steamId.toString(),
              username: donation.UserKOFIDonation[0].user.steamProfile.username,
              avatar: {
                small: donation.UserKOFIDonation[0].user.steamProfile.avatar_small,
                medium: donation.UserKOFIDonation[0].user.steamProfile.avatar_medium,
                large: donation.UserKOFIDonation[0].user.steamProfile.avatar_full
              }
            }
          : null
    };
  });

  const costsMapped = costs.map((cost) => {
    return {
      time: cost.createdAt,
      amount: cost.amount,
      message: cost.description
    };
  });

  // Get the total amount of donations
  const totalDonations = donationsMapped.reduce((acc, donation) => {
    return acc + donation.amount;
  }, 0);

  // Get the total amount of costs
  const totalCosts = costsMapped.reduce((acc, cost) => {
    return acc + cost.amount;
  }, 0);

  // Get the total amount of donations minus the total amount of costs
  const total = totalDonations - totalCosts;

  // Accumulate the donations using the display_name as the key
  const donationsAccumulated = donationsMapped.reduce((acc, donation) => {
    if (acc[donation.display_name]) {
      acc[donation.display_name].amount += donation.amount;
    } else {
      // Do a deep copy of the donation object
      acc[donation.display_name] = JSON.parse(JSON.stringify(donation));
    }

    return acc;
  }, {} as Record<string, (typeof donationsMapped)[0]>);

  // Get the top 3 donators
  const topDonators = Object.values(donationsAccumulated)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return {
    donations: donationsMapped,
    costs: costsMapped,
    topDonators: topDonators,
    totalDonations,
    totalCosts,
    total
  };
}) satisfies PageServerLoad;
