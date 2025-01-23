import { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import userSchema from '../typings/schemas/userSchema';
import * as EMOJI from '../configs/emoji.json'

export default {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'bio') {
 
        }

        if (interaction.customId === 'Title') {
      
        }

        if (interaction.customId.startsWith('settings_')) {  
            const messageId = interaction.customId.split("_")[1];  
            const message = messageId

            const userSchemaData = await userSchema.findOne({ UserID: interaction.user.id})
            
            const embed = new EmbedBuilder()
            .setDescription(`Gestisci le tue impostazioni qui\n\n${EMOJI.shield} **Privacy:** ${userSchemaData?.Privacy}\n${EMOJI.palette} **Theme:** ${userSchemaData?.Theme}\n\nPremi il pulsante ${EMOJI.question} per ottenere più informazioni riguardo le impostazioni`)
            .setColor('#2b2d31')

            const components: ActionRowBuilder<ButtonBuilder>[] = [];

            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('info')
                .setEmoji(`${EMOJI.question}`)
                .setStyle(ButtonStyle.Secondary)
            )
            components.push(row); 

            await message.edit({ embeds: [embed], components})
        }
    }
};
