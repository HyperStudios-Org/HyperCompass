const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const serverSchema = require('../../schemas/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search servers by tags')
        .addStringOption(option => 
            option.setName('tag')
                .setDescription('Choose a tag to search servers')
                .setRequired(true)
                .addChoices(
                    { name: 'Hosting', value: 'Hosting' },
                    { name: 'Community', value: 'Community' },
                    { name: 'Bot Support', value: 'Bot Support' },
                    { name: 'Games', value: 'Games' }
                    // Aggiungi altre scelte se necessario
                )),
    
    async execute(interaction) {
        const tag = interaction.options.getString('tag');

        // Trova tutti i server con il tag selezionato
        const servers = await serverSchema.find({ Tag: tag });

        if (servers.length === 0) {
            await interaction.reply({ content: `No servers found with the tag "${tag}".`, ephemeral: true });
            return;
        }

        const embeds = [];
        const serversPerPage = 5; // Numero di server mostrati per pagina

        // Crea embed per ogni server, raggruppando in pagine
        for (let i = 0; i < servers.length; i += serversPerPage) {
            const currentServers = servers.slice(i, i + serversPerPage);

            const embed = new EmbedBuilder()
                .setTitle(`Servers with tag: ${tag}`)
                .setColor('#00FF00')
                .setFooter({ text: `Page ${Math.ceil(i / serversPerPage) + 1} of ${Math.ceil(servers.length / serversPerPage)}` });

            currentServers.forEach(server => {
                embed.addFields(
                    { name: 'Server Description', value: server.Description || 'No description', inline: false },
                    { name: 'Invite Link', value: server.Invite, inline: false }
                );
            });

            embeds.push(embed);
        }

        let currentPage = 0;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prevPage')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('nextPage')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === embeds.length - 1)
            );

        const message = await interaction.reply({ embeds: [embeds[currentPage]], components: [row], fetchReply: true });

        const filter = i => i.customId === 'prevPage' || i.customId === 'nextPage';
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'prevPage') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i.customId === 'nextPage') {
                currentPage = Math.min(currentPage + 1, embeds.length - 1);
            }

            const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prevPage')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('nextPage')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === embeds.length - 1)
                );

            await i.update({ embeds: [embeds[currentPage]], components: [newRow] });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prevPage')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('nextPage')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

            await message.edit({ components: [disabledRow] });
        });
    }
};
