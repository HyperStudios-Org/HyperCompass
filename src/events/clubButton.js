const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const clubSchema = require('../schemas/clubSchema');

module.exports = {
    name: Events.InteractionCreate,
    Once: false,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        const userId = interaction.user.id;
        const [action, clubID] = interaction.customId.split('_');  

        if (action === 'avanti') {
            console.log(`Club ID: ${clubID}`);  

            const club = await clubSchema.findOne({ ClubID: clubID });
            
            if (!club) {
                return interaction.reply({ content: 'Club non trovato.', ephemeral: true });
            }

            const userRole = club.Ruoli.find(role => role.UserID === userId);
            if (!userRole || (userRole.Role !== 'Ownership' && userRole.Role !== 'Admin')) {
                return interaction.reply({ content: 'Non hai i permessi per modificare questo club.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Descrizione Club')
                .setDescription('In questa pagina puoi modificare la descrizione del club.')
                .setColor('#2b2d31');

            const navigationButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`indietro_${clubID}`)
                        .setEmoji('<:HY_Left:1291666625958776883>')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(false),
                    
                    new ButtonBuilder()
                        .setCustomId('pagina_corrente')
                        .setLabel('Pagina 1/2')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId(`seconda_pagina_${clubID}`)
                        .setEmoji('<:HY_Right:1291053827801481379>')
                        .setStyle(ButtonStyle.Secondary)
                );

            const modifyButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`modifica_descrizione_${clubID}`)
                        .setLabel('Modifica Descrizione Club')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.update({ embeds: [embed], components: [navigationButtons, modifyButton] });
        } else if (action === 'seconda_pagina') {
            const embedSecondPage = new EmbedBuilder()
                .setTitle('Gestione Ruoli')
                .setDescription('In questa pagina puoi gestire i ruoli del club.')
                .setColor('#2b2d31');

            const buttonsSecondPage = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`indietro_${clubID}`)
                        .setEmoji('<:HY_Left:1291666625958776883>')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(false),

                    new ButtonBuilder()
                        .setCustomId('pagina_corrente')
                        .setLabel('Pagina 2/2')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId(`modifica_ruoli_${clubID}`)
                        .setLabel('Modifica Ruoli')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.update({ embeds: [embedSecondPage], components: [buttonsSecondPage] });
        }

        if (interaction.customId.startsWith('modifica_descrizione')) {
            console.log('Apertura del modal per modificare la descrizione...');

            const modal = new ModalBuilder()
                .setCustomId(`modifica_descrizione_modal_${clubID}`)
                .setTitle('Modifica Descrizione del Club');

            const clubDescriptionInput = new TextInputBuilder()
                .setCustomId('club_description')
                .setLabel('Nuova Descrizione del Club')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(clubDescriptionInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
            return; 
        }

        if (interaction.customId.startsWith('modifica_descrizione_modal')) {
            console.log('test')
            const clubID = interaction.customId.split('_')[3]; 
            const nuovaDescrizione = interaction.fields.getTextInputValue('club_description');

            try {
                await clubSchema.updateOne({ ClubID: clubID }, { ClubDescription: nuovaDescrizione });
                await interaction.reply({ content: 'Descrizione del club aggiornata con successo!', ephemeral: true });
            } catch (error) {
                console.error('Errore durante l\'aggiornamento della descrizione:', error);
                await interaction.reply({ content: 'Si è verificato un errore durante l\'aggiornamento della descrizione.', ephemeral: true });
            }
        }
    }
};
