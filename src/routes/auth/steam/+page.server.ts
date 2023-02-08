import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSteamLoginURL } from "../../../lib/auth/steam";

export const load = (async ({ params }) => {

  // Get the steam login URL
  const steamLoginURL = await getSteamLoginURL();

  // Redirect to the steam login URL
  throw redirect(302, steamLoginURL);

}) satisfies PageServerLoad;
