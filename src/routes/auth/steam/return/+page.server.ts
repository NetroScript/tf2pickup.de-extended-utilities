import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { authenticateSteamCallback } from '$lib/auth/steam';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import prisma from '$lib/database/prisma';
import { upsertUser } from '../../../../lib/database/user';

export const load = (async ({ params, url, cookies }) => {
	// Validate the steam login
	try {
		const steamUser = await authenticateSteamCallback(url.href);

		// Upsert the user in the database
		await upsertUser(steamUser);

		// Create a JWT token
		const token = jwt.sign({ id: steamUser.steamID }, JWT_SECRET, { expiresIn: '28d' });

		// Save the token in a cookie, valid for 4 weeks
		cookies.set('jwt', token, { maxAge: 1209600, path: '/' });

		// Check if a redirectURL cookie exists
		const redirectURL = cookies.get('returnURL');

		console.log('redirectURL: ', redirectURL);

		if (redirectURL) {
			// Delete the redirectURL cookie
			cookies.delete('returnURL', { path: '/' });
			throw redirect(302, redirectURL);
		}

		return {
			success: true
		};
	} catch (e: any) {
		if (e.status == 302) {
			throw e;
		}
		console.log('Failed to authenticate Steam user: ', e);
	}

	// Throw not authenticated error by default
	throw error(401, 'Not authenticated (Steam Login Failed)');
}) satisfies PageServerLoad;
