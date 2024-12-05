const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');
const serverSchema = require('../../schemas/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Gestisci il profilo del server')
        .addSubcommand(command =>
            command
                .setName('settings')
                .setDescription('Modifica il profilo del server')
        )
        .addSubcommand(command =>
            command
                .setName('info')
                .setDescription('Visualizza le informazioni del server')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'settings') {
            let serverSchemaData = await serverSchema.findOne({ GuildID: interaction.guild.id });

            if (!serverSchemaData) {
                serverSchemaData = await serverSchema.create({
                    GuildID: interaction.guild.id,
                    Description: "",
                    Rank: "Default",
                    Points: 0,
                    Decoration: []
                });
            }

            const description = serverSchemaData.Description || 'Non impostata';
            const rank = serverSchemaData.Rank || 'Default';
            const points = serverSchemaData.Points || 0;
            const decorationCount = serverSchemaData.Decoration ? serverSchemaData.Decoration.length : 0;

            // Crea la canvas
            const canvas = Canvas.createCanvas(800, 400);
            const context = canvas.getContext('2d');

            // Imposta uno sfondo per l'immagine
            context.fillStyle = '#2c2f33';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Imposta la font per il testo
            context.font = '30px Arial';
            context.fillStyle = '#FFFFFF';
            context.textAlign = 'center';

            // Aggiungi le informazioni del server
            context.fillText(`Nome del Server: ${interaction.guild.name}`, canvas.width / 2, 50);
            context.fillText(`Descrizione: ${description}`, canvas.width / 2, 100);
            context.fillText(`Rank: ${rank}`, canvas.width / 2, 150);
            context.fillText(`Punti: ${points}`, canvas.width / 2, 200);
            context.fillText(`Decorazioni: ${decorationCount}`, canvas.width / 2, 250);

            // Aggiungi l'avatar del server
            const avatar = await Canvas.loadImage(interaction.guild.iconURL({ format: 'png', size: 512 }));
            context.drawImage(avatar, canvas.width / 2 - 64, 300, 128, 128);

            // Converte il canvas in un buffer
            const buffer = canvas.toBuffer();

            // Crea l'allegato
            const attachment = new AttachmentBuilder(buffer, { name: 'server-settings.png' });

            // Invia l'immagine
            await interaction.reply({ files: [attachment] });

        } else if (subcommand === 'info') {
            const serverInfoEmbed = new EmbedBuilder()
                .setTitle('Info del Server')
                .setDescription(`Ecco alcune informazioni sul server **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Membri Totali', value: `${interaction.guild.memberCount || 0}`, inline: true },
                    { name: 'Creato il', value: `${interaction.guild.createdAt.toDateString()}`, inline: true },
                )
                .setColor('Blue')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || '');

            await interaction.reply({ embeds: [serverInfoEmbed] });
        }
    },
};
