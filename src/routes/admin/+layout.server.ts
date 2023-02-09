import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent }) => {
  // Check that the user is an admin to continue
  const data = await parent();

  // If the user is not an admin, throw 404
  if (!data.user?.admin) {
    throw error(404, 'Page not found');
  }
}) satisfies LayoutServerLoad;
