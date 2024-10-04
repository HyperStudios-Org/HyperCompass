const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    Once: false,

    async execute(interaction) {

        if (interaction.customId.startsWith('description_')) {

            const club = interaction.customId.split('_'); 

       
            console.log(club);
        }
    }
};
