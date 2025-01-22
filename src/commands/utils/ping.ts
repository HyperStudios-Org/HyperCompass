import { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import * as EMOJI from '../../configs/emoji.json'
import mongoose from 'mongoose'
import config from '../../configs/config.json'

export default {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong'),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const startTime = Date.now()
        try {
  
            await mongoose.connect(config.mongodb);
            await mongoose.connection.db?.command({ ping: 1});
            const dbLatency = Date.now() - startTime
            const apiLatency = client.ws.ping

            const embed = new EmbedBuilder()
            .setDescription(`${EMOJI.green_rocket}La **Latenza** del bot è di **${Date.now() - interaction.createdTimestamp}ms**\n\n${EMOJI.database}**Database:** ${dbLatency}ms\n${EMOJI.globe}**Api:** ${apiLatency} `)
            .setColor('#2b2d31')

            await interaction.reply({ embeds: [embed]})
        } catch (err) {
            console.log(err)
        }

    }
}