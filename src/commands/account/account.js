const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');
const userSchema = require('../../schemas/userSchema');
const moment = require('moment');  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('account')
        .setDescription('Account management')
        .addSubcommand(command =>
            command.setName('create')
                .setDescription('Create an account')
                .addAttachmentOption(option =>
                    option.setName('pfp')
                        .setDescription('Upload a profile picture')
                        .setRequired(false)
                ))
        .addSubcommand(command =>
            command.setName('delete')
                .setDescription('Delete your account'))
        .addSubcommand(command =>
            command.setName('info')
                .setDescription('View your account info')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
      
            const userExists = await userSchema.findOne({ User: interaction.user.id });

            if (userExists) {
                await interaction.reply('You already have an account!');
            } else {
               
                const modal = new ModalBuilder()
                    .setCustomId('createAccountModal')
                    .setTitle('Create Account');

             
                const usernameInput = new TextInputBuilder()
                    .setCustomId('usernameInput')
                    .setLabel('Username')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

   
                const bioInput = new TextInputBuilder()
                    .setCustomId('bioInput')
                    .setLabel('Bio')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

       
                modal.addComponents(
                    new ActionRowBuilder().addComponents(usernameInput),
                    new ActionRowBuilder().addComponents(bioInput)
                );

            
                await interaction.showModal(modal);

            
                interaction.awaitModalSubmit({ time: 60000 })
                    .then(async modalInteraction => {
                        const username = modalInteraction.fields.getTextInputValue('usernameInput');
                        const bio = modalInteraction.fields.getTextInputValue('bioInput');

                        
                        const initials = username.slice(0, 2).toUpperCase();

              
                        const canvas = Canvas.createCanvas(100, 100);
                        const context = canvas.getContext('2d');

                        
                        const colors = ['#FF5733', '#C0C0C0', '#FFD700', '#1E90FF', '#FF4500'];
                        const backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        context.fillStyle = backgroundColor;
                        context.fillRect(0, 0, canvas.width, canvas.height);

                  
                        context.font = 'bold 40px Arial';
                        context.fillStyle = '#FFFFFF';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(initials, canvas.width / 2, canvas.height / 2);

                      
                        const buffer = canvas.toBuffer();
                        const attachment = new AttachmentBuilder(buffer, { name: 'profile-image.png' });

          
                        const channel = await interaction.client.channels.fetch('1280101888213127241');
                        const message = await channel.send({ files: [attachment] });

 
                        const profileImageUrl = message.attachments.first().url;

             
                        const newUser = new userSchema({
                            User: interaction.user.id,
                            Username: username,
                            Bio: bio,
                            ProfileIcon: profileImageUrl, 
                            Commands: 1,
                            HyperCoins: 300,
                            Quest: [],
                            Item: [],
                            Creazione: new Date(),
                            Sospeso: false
                        });

                        await newUser.save();

                        await modalInteraction.reply('Account created successfully!');
                    })
                    .catch(async () => {
                        await interaction.followUp({ content: 'You did not fill out the form in time.', ephemeral: true });
                    });
            }
        } else if (subcommand === 'delete') {
     
            const userExists = await userSchema.findOne({ User: interaction.user.id });

            if (!userExists) {
                await interaction.reply('You do not have an account to delete.');
            } else {
                await userSchema.deleteOne({ User: interaction.user.id });
                await interaction.reply('Account deleted successfully!');
            }
        } else if (subcommand === 'info') {

            const user = await userSchema.findOne({ User: interaction.user.id });

            if (!user) {
                await interaction.reply('You do not have an account.');
            } else {
            
                const formattedDate = moment(user.Creazione).format('DD/MM/YY');

                const embed = new EmbedBuilder()
                    .setTitle(`${user.Username}'s Account`)
                    .setDescription(`Below is the information for the account in question:\n\n**<:name:1280886348596645929>__Username:__** ${user.Username}\n\n**<:copied:1280660302664568865>__Description:__** ${user.Bio}\n\n**<:grafico:1280661171464175680>__Commands:__** ${user.Commands}\n\n**<:money:1280886801728278609>__HyperCoins:__** ${user.HyperCoins}\n\n**<:question:1280887580237369397>__Creation Date:__** ${formattedDate}\n\n**<:suspended:1280887774433771531>__Suspended:__**: ${user.Sospeso}`)
                    .setThumbnail(user.ProfileIcon) 
                    .setColor('#00FF00');

                await interaction.reply({ embeds: [embed] });
            }
        }
    }
};
