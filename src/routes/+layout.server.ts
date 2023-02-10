import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/database/prisma';

export const load = (async ({ cookies }) => {
  // Check if the user is logged in by checking if the JWT token is valid

  const token = cookies.get('jwt');

  if (token) {
    try {
      const { id } = jwt.verify(token || '', JWT_SECRET) as { id: string };

      // Check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: {
          steamId: BigInt(id)
        },
        include: {
          steamProfile: true
        }
      });

      if (user) {
        return {
          user: {
            id: user.steamId,
            username: user.steamProfile.username,
            avatar: {
              small: user.steamProfile.avatar_small,
              medium: user.steamProfile.avatar_medium,
              large: user.steamProfile.avatar_full
            },
            admin: user.admin ? true : undefined
          }
        };
      } else {
        console.log('User not found in database: ', id);
      }
    } catch (e) {
      console.log('Failed to authenticate user: ', e);
    }
  }

  return {
    user: null
  };
}) satisfies LayoutServerLoad;
