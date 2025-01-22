import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction } from "discord.js";
import userSchema from '../../typings/schemas/userSchema';
import * as EMOJI from '../../configs/emoji.json';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Show user profile')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view profile')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user') || interaction.user;
        let userSchemaData = await userSchema.findOne({ UserID: user.id });

        if (!userSchemaData) {
            userSchemaData = await userSchema.create({
                UserID: user.id,
                HyperCoins: 100,
                Bio: "Nuovo Utente",
                Title: "",
                Privacy: false,
                Admin: false,
                Theme: "Default",
                Language: ""
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${EMOJI.blue_dashboard}**__Profilo di ${user.username}__**`)
            .setDescription(`${EMOJI.ping} **User:** <@${user.id}>\n${EMOJI.user} **ID:** ${user.id}\n${EMOJI.admin} **Admin:** ${userSchemaData.Admin}\n\n${EMOJI.wallet} **HyperCoins:** ${userSchemaData.HyperCoins}\u200b${EMOJI.sliders}: **Titolo:** ${userSchemaData.Title || "Nessun titolo"}`)
            .setColor('#2b2d31');

        await interaction.reply({ embeds: [embed] });
    }
};
