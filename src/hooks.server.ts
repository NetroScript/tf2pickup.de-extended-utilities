import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { createTRPCHandle } from 'trpc-sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { DiscordClient } from './lib/server/discord/main';
import { DISCORD_BOT_TOKEN, DISCORD_BOT_ENABLED } from '$env/static/private';

const trpcHandler = createTRPCHandle({
  router,
  createContext,
  onError: ({ type, path, error }) =>
    console.error(`Encountered error while trying to process ${type} @ ${path}:`, error)
});

export const handle = sequence(trpcHandler);

export const discordClient = new DiscordClient();

if (DISCORD_BOT_ENABLED === 'true') {
  // Login to Discord
  discordClient
    .login(DISCORD_BOT_TOKEN)
    .then(() => {
      console.log('Discord Bot logged in');
    })
    .catch((error) => {
      console.error('Discord Bot failed to login: ', error);
    });
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
