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

        const canvas = Canvas.createCanvas(900, 500); 
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#2f3136'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        

        // Header
        ctx.fillStyle = '#4c4cff';

        const x = 50;   
        const y = 50;    
        const width = 800;  
        const height = 300; 
        const radius = 50;  
        
 
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '30px sans-serif';
        ctx.fillText('PROFILO', 100, 100);
        ctx.fillText(interaction.guild.name, 100, 140);
        ctx.fillText(`ID: ${interaction.guild.id}`, 600, 100);
        ctx.fillText(`Creato il: ${interaction.guild.createdAt.toDateString()}`, 600, 140);

        // Statistiche
        ctx.fillStyle = '#2f3136';
        ctx.fillRect(50, 200, 800, 250); 

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.fillText('Descrizione:', 100, 250);
        ctx.fillText(Description, 300, 250);

        ctx.fillText('Rank:', 100, 300);
        ctx.fillText(Rank, 300, 300);

        ctx.fillText('Punti:', 100, 350);
        ctx.fillText(Points, 300, 350);

        ctx.fillText('Coins:', 100, 400);
        ctx.fillText(Coins, 300, 400);

        // Avatar
        const avatar = await Canvas.loadImage(interaction.guild.iconURL({ extension: 'png', size: 512 }) || './default-avatar.png');
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 120, 50, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 100, 70, 100, 100);
        ctx.restore();

      
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });

        await interaction.deferReply();
        await interaction.editReply({ files: [attachment] });
    },
};
