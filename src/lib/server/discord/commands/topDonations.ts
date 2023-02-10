import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../types';
import { getTopDonators } from '../../database/donations';

export const topDonators: SlashCommand = {
  command: new SlashCommandBuilder().setName('topdonators').setDescription('Get the top 3 donators'),
  execute: async (interaction) => {
    // Fetch the top 3 donators
    const topDonators = await getTopDonators(3);

    // If there are no donators, send a message
    if (topDonators.length === 0) {
      // Send a message
      await interaction.reply('Es gibt noch keine Spenden :(');
    } else {
      // Send a message
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: 'KoFi',
              iconURL: 'https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e1116779fc0a9bd5bdbcc7_Frame%206.png'
            })
            .setTitle('Hier sind die Top 3 Spender:')
            .addFields(
              topDonators.map((donator, index) => {
                // Depending on the index make it bold, underlined, bold or normal
                const decoration = index === 0 ? '**' : index === 1 ? '__' : '';

                return {
                  name: `${index + 1}. ${donator.from_name}`,
                  value: `${decoration}${donator.amount}€${decoration.split('').reverse().join('')}`
                };
              })
            )
            .setColor('#ff5e5b')
            .setFooter({
              text: 'Du willst auch unterstützen? Dann spende auf https://ko-fi.com/tf2pickupde'
            })
        ]
      });
    }
  }
};
