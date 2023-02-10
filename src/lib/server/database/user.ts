import type { PlayerSummary } from 'steamapi';
import prisma from './prisma';

import type { Prisma } from '@prisma/client';

export type UserWithSteamProfile = Prisma.UserGetPayload<{
  include: {
    steamProfile: true;
  };
}>;

export const upsertUser = async (steamUser: PlayerSummary): Promise<UserWithSteamProfile> => {
  return await prisma.user.upsert({
    where: {
      steamId: BigInt(steamUser.steamID)
    },
    create: {
      steamProfile: {
        create: {
          steamId: BigInt(steamUser.steamID),
          username: steamUser.nickname,
          avatar_small: steamUser.avatar.small,
          avatar_medium: steamUser.avatar.medium,
          avatar_full: steamUser.avatar.large,
          profileUrl: steamUser.url
        }
      }
    },
    update: {
      steamProfile: {
        update: {
          username: steamUser.nickname,
          avatar_small: steamUser.avatar.small,
          avatar_medium: steamUser.avatar.medium,
          avatar_full: steamUser.avatar.large,
          profileUrl: steamUser.url
        }
      }
    },
    include: {
      steamProfile: true
    }
  });
};
