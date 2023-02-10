import type { PageServerLoad } from './$types';
import prisma from '../lib/server/database/prisma';
import { getLastNDonations, getMinimalDonationInfo, getTopDonators } from '../lib/server/database/donations';

export const load = (async ({ params }) => {
  // Fetch all KOFI donations, and if there is a user associated with it, fetch the user
  const donations = await getLastNDonations();

  // Fetch all Costs
  const costs = await prisma.costTransaction.findMany({ orderBy: { createdAt: 'desc' } });

  // Map the donations to a new array
  const donationsMapped = getMinimalDonationInfo(donations);

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

  // Get the top 3 donators
  const topDonators = getMinimalDonationInfo(await getTopDonators(3));

  return {
    donations: donationsMapped,
    costs: costsMapped,
    topDonators: topDonators,
    totalDonations,
    totalCosts,
    total
  };
}) satisfies PageServerLoad;
