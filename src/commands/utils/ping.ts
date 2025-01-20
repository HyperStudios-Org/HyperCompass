import { SlashCommandBuilder, Client, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong'),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.reply({ content: 'ciao'})
    }
}