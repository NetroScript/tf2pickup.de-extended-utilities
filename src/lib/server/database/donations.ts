// Get all donations we had so far
import prisma from './prisma';
import type { Prisma } from '@prisma/client';

export type DataBaseDonation = Prisma.KOFIDonationGetPayload<{
  include: {
    UserKOFIDonation: {
      include: {
        user: {
          include: {
            steamProfile: true;
          };
        };
      };
    };
  };
}>;

export const getLastNDonations = async (amount: number | undefined = undefined): Promise<DataBaseDonation[]> => {
  // Get the donations from the database
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
    },
    take: amount
  });

  // Return the donations
  return donations;
};

export const getTopDonators = async (limit: number): Promise<DataBaseDonation[]> => {
  /*
  // Sadly we currently can't do this in a single native prisma query, so we have to use raw SQL
  const donations = await prisma.$queryRaw<DataBaseDonation[]>`SELECT *,
                                  SUM("amount")
                                    AS "total_amount"
                           FROM "KOFIDonation"
                                  LEFT JOIN UserKOFIDonation UKD on KOFIDonation.id = UKD.donationId
                                  LEFT JOIN User U on U.steamId = UKD.userId
                                  LEFT JOIN SteamUserInformation SUI on SUI.steamId = U.steamId
                           GROUP BY "from_name"
                           ORDER BY "total_amount"
                             DESC
                             LIMIT ${limit};`;
  */

  const donations = (
    await prisma.kOFIDonation.groupBy({
      by: ['from_name'],
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: limit
    })
  ).map(async (donation): Promise<DataBaseDonation> => {
    // Fetch the full donation info
    const fullDonation = await prisma.kOFIDonation.findFirst({
      where: {
        from_name: donation.from_name,
        UserKOFIDonation: {
          some: {}
        }
      },
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
      }
    });

    // If we found a donation, return it with the user info, but set the amount to the returned value
    if (fullDonation) {
      return {
        ...fullDonation,
        amount: donation._sum.amount ?? -1
      };
    } else {
      // If we didn't find a donation, find the first donation without a user
      const donationWithoutUser = await prisma.kOFIDonation.findFirst({
        where: {
          from_name: donation.from_name
        }
      });

      // If we found a donation without a user, return it with the user info, but set the amount to the returned value
      if (donationWithoutUser) {
        return {
          ...donationWithoutUser,
          amount: donation._sum.amount ?? -1,
          UserKOFIDonation: []
        };
      }

      // Otherwise throw an error as for some reason we didn't find a donation
      throw new Error('Could not find donation');
    }
  });

  // Return the donations
  return Promise.all(donations);
};

export const getMinimalDonationInfo = (donations: DataBaseDonation[]) =>
  donations.map((donation) => {
    return {
      time: donation.createdAt,
      display_name: donation.from_name,
      amount: donation.amount,
      currency: donation.currency,
      message: donation.is_public ? donation.message : null,
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
