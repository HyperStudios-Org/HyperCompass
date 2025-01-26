import { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import userSchema from '../typings/schemas/userSchema';
import * as EMOJI from '../configs/emoji.json'

export default {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('settings_')) {  
            const messageId = interaction.customId.split("_")[1];
            try {
                const message = await interaction.channel.messages.fetch(messageId);

                const userSchemaData = await userSchema.findOne({ UserID: interaction.user.id });
                
                const embed = new EmbedBuilder()
                    .setDescription(`Gestisci le tue impostazioni qui\n\n${EMOJI.shield} **Privacy:** ${userSchemaData?.Privacy}\n${EMOJI.palette} **Theme:** ${userSchemaData?.Theme}`)
                    .setColor('#2b2d31');

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('privacy')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(`${EMOJI.shield}`),
                        new ButtonBuilder()
                        .setCustomId('theme')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(`${EMOJI.palette}`),
                        new ButtonBuilder()
                            .setCustomId('info')
                            .setEmoji(`${EMOJI.question}`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                await message.edit({ embeds: [embed], components: [row] });

            } catch (error) {
                if (error.code === 10008) {
                    await interaction.reply({ content: 'Il messaggio non esiste più.', ephemeral: true });
                } else {
                    console.error('Errore sconosciuto:', error);
                }
            }

            if (interaction.customId === 'privacy') {
                const userId = interaction.user.id
                const userSchemaData = await userSchema.findOne({ UserID: userId })
                
                console.log(userSchemaData)
            }

            if (interaction.customId === 'theme') {

                
                
            }
        }

        


    }
};
