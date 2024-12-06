const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const serverSchema = require('../../schemas/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Visualizza o modifica il profilo del server')
        .addSubcommand(command =>
            command
                .setName('settings')
                .setDescription('Modifica il profilo del server')
        ),

    async execute(interaction) {
        const serverSchemaData = await serverSchema.findOne({ GuildID: interaction.guild.id }) || {
            GuildID: interaction.guild.id,
            Description: "Non impostata",
            Rank: "Default",
            Points: 0,
            Coins: 0,
            Decoration: [],
        };

        const { Description, Rank, Points, Coins } = serverSchemaData;

  
        const canvas = Canvas.createCanvas(1100, 600);
        const ctx = canvas.getContext('2d');

    
        const backgroundColor = '#bf2c27'; 
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        const headerX = 20, headerY = 20, headerWidth = canvas.width - 40, headerHeight = 160, radius = 30;
        ctx.fillStyle = '#7c3aed'; 
        ctx.beginPath();
        ctx.moveTo(headerX + radius, headerY);
        ctx.arcTo(headerX + headerWidth, headerY, headerX + headerWidth, headerY + headerHeight, radius);
        ctx.arcTo(headerX + headerWidth, headerY + headerHeight, headerX, headerY + headerHeight, radius);
        ctx.arcTo(headerX, headerY + headerHeight, headerX, headerY, radius);
        ctx.arcTo(headerX, headerY, headerX + headerWidth, headerY, radius);
        ctx.closePath();
        ctx.fill();

        // Header content
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(interaction.guild.name, 50, 90);
        ctx.font = '20px sans-serif';
        ctx.fillText(`ID: ${interaction.guild.id}`, 50, 130);
        ctx.fillText(`Creato in data: ${interaction.guild.createdAt.toDateString()}`, 50, 160);

        // Profile statistics
        const statsX = 20, statsY = 200, statsWidth = canvas.width - 40, statsHeight = 300;
        ctx.fillStyle = '#2f3136'; 
        ctx.beginPath();
        ctx.moveTo(statsX + radius, statsY);
        ctx.arcTo(statsX + statsWidth, statsY, statsX + statsWidth, statsY + statsHeight, radius);
        ctx.arcTo(statsX + statsWidth, statsY + statsHeight, statsX, statsY + statsHeight, radius);
        ctx.arcTo(statsX, statsY + statsHeight, statsX, statsY, radius);
        ctx.arcTo(statsX, statsY, statsX + statsWidth, statsY, radius);
        ctx.closePath();
        ctx.fill();

        // Stat content
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px sans-serif';
        ctx.fillText('Descrizione:', 50, 250);
        ctx.fillText(Description || 'Non disponibile', 300, 250);

        ctx.fillText('Rank:', 50, 300);
        ctx.fillText(Rank || 'Default', 300, 300);

        ctx.fillText('Punti:', 50, 350);
        ctx.fillText((Points || 0).toString(), 300, 350);

        ctx.fillText('Coins:', 50, 400);
        ctx.fillText((Coins || 0).toString(), 300, 400);

        // Avatar
        const avatar = await Canvas.loadImage(interaction.guild.iconURL({ extension: 'png', size: 512 }) || './default-avatar.png');
        ctx.save();
        ctx.beginPath();
        ctx.arc(900, 120, 80, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 820, 40, 160, 160);
        ctx.restore();

       
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });
        await interaction.deferReply();
        await interaction.editReply({ files: [attachment] });
    },
};
