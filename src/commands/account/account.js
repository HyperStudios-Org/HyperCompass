const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
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
                        .setRequired(true)
                ))
        .addSubcommand(command =>
            command.setName('delete')
                .setDescription('Delete your account'))
        .addSubcommand(command =>
            command.setName('info')
                .setDescription('View account information')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose information you want to view')
                        .setRequired(false)
                )),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            // Check if the user already exists in the database
            const userExists = await userSchema.findOne({ User: interaction.user.id });

            if (userExists) {
                await interaction.reply('You already have an account!');
            } else {
                // Get the profile picture attachment
                const pfp = interaction.options.getAttachment('pfp');

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

                        // Save the new user to the database
                        const newUser = new userSchema({
                            User: interaction.user.id,
                            Username: username,
                            Bio: bio,
                            ProfileIcon: pfp.url, // Save the URL of the uploaded profile picture
                            Commands: 1,
                            HyperCoins: 300,
                            Quest: [],
                            Item: [],
                            Creazione: new Date('09/03/2024'), // Set to the specific date you provided
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
            // Handle the 'info' subcommand
            const targetUser = interaction.options.getUser('user') || interaction.user;

            // Fetch user data from the database
            const userData = await userSchema.findOne({ User: targetUser.id });

            if (!userData) {
                await interaction.reply('No account found for this user.');
                return;
            }

            // Create an embed to display user information
            const infoEmbed = new EmbedBuilder()
                .setTitle(`${targetUser.username}'s Account Information`)
                .setDescription(`Below is the information for the account in question:\n\n**__Username__**: ${userData.Username}\n**__Description__**: ${userData.Bio}\n**__Commands Used__**: ${userData.Commands}\n**__HyperCoins__**: ${userData.HyperCoins}\n**__Creation Date__**: ${userData.Creazione}\n**__Suspended__**: ${userData.Sospeso}`)
                .setThumbnail(userData.ProfileIcon)
                .setColor('Orange')
                .setTimestamp();

            await interaction.reply({ embeds: [infoEmbed] });
        }
    }
};
