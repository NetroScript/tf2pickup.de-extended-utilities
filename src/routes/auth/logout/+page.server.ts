import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSteamLoginURL } from "../../../lib/auth/steam";

export const load = (async ({ params, cookies }) => {

  // To log out clear the jwt cookie
  cookies.delete('jwt', { path: '/' });

  // Redirect to the home page
  throw redirect(302, '/');

}) satisfies PageServerLoad;
