const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Profile')
    .addSubcommand(command => command.setName('create').setDescription('Crea il profilo per il server'))
    .addSubcommand(command => command.setName('info').setDescription('info del server'))
}