import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import jwt from 'jsonwebtoken';

export async function createContext(event: RequestEvent): Promise<{ id: bigint | null }> {
  try {
    const token = event.cookies.get('jwt');

    const user = jwt.verify(token || '', JWT_SECRET) as { id: bigint | null };

    return user;
  } catch {
    return {id: null};
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;
