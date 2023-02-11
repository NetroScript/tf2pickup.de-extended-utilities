import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { DISCORD_BOT_TOKEN, DISCORD_DONAION_CHANNEL_ID } from '$env/static/private';
import type { Command, SlashCommand } from './types';
import { topDonators } from './commands/topDonations';
import type { DonationEventPayload } from '../events';
import { eventHandlers } from '../events';
import { dev } from '$app/environment';

export class DiscordClient {
  client: Client;
  slashCommands = new Collection<string, SlashCommand>();
  commands = new Collection<string, Command>();
  cooldowns = new Collection<string, number>();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ]
    });
  }

  async login(token: string) {
    const slashCommands: SlashCommand[] = [topDonators];

    // Register slash commands
    for (const command of slashCommands) {
      this.slashCommands.set(command.command.name, command);
    }

    // Run once on startup
    this.client.once(Events.ClientReady, (c) => {
      console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    // Event handler for command interactions
    this.client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (!interaction.isChatInputCommand()) return;

        const command = this.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      } catch (error) {
        console.error('Generic Discord InteractionCreate error');
        console.error(error);
      }
    });

    eventHandlers.newDonationEvt.attach(async (event) => {
      try {
        await this.sendDonationMessage(event);
      } catch (error) {
        console.error('Error while sending donation message');
        console.error(error);
      }
    });

    await this.client.login(token);
  }

  // Should only be called from an admin request
  async registerSlashCommands() {
    // Get own client ID
    const clientId = this.client.application?.id;

    // If it's not defined throw an error as we are not logged in
    if (!clientId) throw new Error('Client ID is not defined');

    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
    const commandData = this.slashCommands.map((command) => command.command.toJSON());

    const response = await rest.put(Routes.applicationCommands(clientId), { body: commandData });

    console.log('Successfully registered application commands.');
  }

  private async sendDonationMessage(event: DonationEventPayload) {
    // Send an embed to the #donations channel
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setAuthor({
        name: 'KoFi',
        iconURL: 'https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e1116779fc0a9bd5bdbcc7_Frame%206.png'
      })
      .setThumbnail(
        event.steamUser
          ? event.steamUser.steamProfile.avatar_full
          : 'https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e1116779fc0a9bd5bdbcc7_Frame%206.png'
      )
      .setTitle('Eine neue Spende über Ko-Fi!')
      .setURL('https://ko-fi.com/tf2pickupde')
      .addFields(
        [
          {
            name: 'Name',
            value: event.donation.from_name ?? 'Anonym',
            inline: true
          },
          {
            name: 'Betrag',
            value: `${event.donation.amount}${event.donation.currency === 'EUR' ? '€' : event.donation.currency}`,
            inline: true
          }
        ].concat(
          event.donation.is_public && event.donation.message
            ? [
                {
                  name: 'Nachricht',
                  value: event.donation.message,
                  inline: false
                }
              ]
            : []
        )
      )
      .setTimestamp(new Date(event.donation.timestamp))
      .setFooter({
        text: `Vielen Dank an ${event.donation.from_name ?? 'diesen anonymen Spender'} für die Spende!`
      });

    if (dev) {
      // Send it privately to a user
      await this.client.users.fetch('187986102198599680').then((user) => {
        if (user) {
          user.send({ embeds: [embed] });
        }
      });
    } else {
      // Send this to the #spenden-tracking channel
      await this.client.channels.fetch(DISCORD_DONAION_CHANNEL_ID).then((channel) => {
        if (channel && channel.isTextBased()) {
          channel.send({ embeds: [embed] });
        }
      });
    }
  }
}
