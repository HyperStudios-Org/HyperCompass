const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');
const userSchema = require('../../schemas/userSchema');

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
                        .setRequired(false) // Make the profile picture optional
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
            // Check if the user already exists in the database
            const userExists = await userSchema.findOne({ User: interaction.user.id });

            if (userExists) {
                await interaction.reply('You already have an account!');
            } else {
                // Create and show the modal for username and bio input
                const modal = new ModalBuilder()
                    .setCustomId('createAccountModal')
                    .setTitle('Create Account');

                // Username input
                const usernameInput = new TextInputBuilder()
                    .setCustomId('usernameInput')
                    .setLabel('Username')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                // Bio input
                const bioInput = new TextInputBuilder()
                    .setCustomId('bioInput')
                    .setLabel('Bio')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                // Add the inputs to the modal
                modal.addComponents(
                    new ActionRowBuilder().addComponents(usernameInput),
                    new ActionRowBuilder().addComponents(bioInput)
                );

                // Show the modal to the user
                await interaction.showModal(modal);

                // Handle modal submission
                interaction.awaitModalSubmit({ time: 60000 })
                    .then(async modalInteraction => {
                        const username = modalInteraction.fields.getTextInputValue('usernameInput');
                        const bio = modalInteraction.fields.getTextInputValue('bioInput');

                        // Extract the first two letters of the username for the icon
                        const initials = username.slice(0, 2).toUpperCase();

                        // Generate a graphic with initials
                        const canvas = Canvas.createCanvas(100, 100);
                        const context = canvas.getContext('2d');

                        // Choose a random background color
                        const colors = ['#FF5733', '#C0C0C0', '#FFD700', '#1E90FF', '#FF4500'];
                        const backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        context.fillStyle = backgroundColor;
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        // Add initials to the canvas
                        context.font = 'bold 40px Arial';
                        context.fillStyle = '#FFFFFF';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(initials, canvas.width / 2, canvas.height / 2);

                        // Convert canvas to image buffer and prepare for attachment
                        const buffer = canvas.toBuffer();
                        const attachment = new AttachmentBuilder(buffer, { name: 'profile-image.png' });

                        // Send the image to a specific channel to get the URL
                        const channel = await interaction.client.channels.fetch('1280101888213127241');
                        const message = await channel.send({ files: [attachment] });

                        // Get the URL of the uploaded image
                        const profileImageUrl = message.attachments.first().url;

                        // Save the new user to the database
                        const newUser = new userSchema({
                            User: interaction.user.id,
                            Username: username,
                            Bio: bio,
                            ProfileIcon: profileImageUrl, // Save the URL of the uploaded/generated profile picture
                            Commands: 1,
                            HyperCoins: 300,
                            Quest: [],
                            Item: [],
                            Creazione: new Date(), // Current date and time
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
            // Logic for deleting an account
            const userExists = await userSchema.findOne({ User: interaction.user.id });

            if (!userExists) {
                await interaction.reply('You do not have an account to delete.');
            } else {
                await userSchema.deleteOne({ User: interaction.user.id });
                await interaction.reply('Account deleted successfully!');
            }
        } else if (subcommand === 'info') {
            // Logic for displaying account info
            const user = await userSchema.findOne({ User: interaction.user.id });

            if (!user) {
                await interaction.reply('You do not have an account.');
            } else {
                // Create an embed with the user's information
                const embed = new EmbedBuilder()
                    .setTitle(`${user.Username}'s Account`)
                    .setDescription(`Below is the information for the account in question:\n\n**__Username__**`)
                    .setThumbnail(user.ProfileIcon) // Use the ProfileIcon URL from the database
                    .setColor('#00FF00');

                await interaction.reply({ embeds: [embed] });
            }
        }
    }
};
