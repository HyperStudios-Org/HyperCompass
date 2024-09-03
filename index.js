const config = require('./src/configs/config.json')
const mongoose = require('mongoose');
const chalk = require('chalk');
const { Client, GatewayIntentBits, Collection, ActivityType, Partials, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.AutoModerationConfiguration
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

module.exports = { client }


console.log(chalk.red(`© Hyper Studios | 2024 - ${new Date().getFullYear()}`))
console.log(chalk.red('Version:'), chalk.red('0.2V'), chalk.blue('| Developer State'))
console.log(chalk.red(`All rights reserved`))


client.commands = new Collection();

const token = config.token; // Inserisci il tuo token qui
const prefix = config.prefix; // Puoi cambiare il prefisso a tuo piacimento
const mongodb = config.mongodb // inserisci il file mongodb

const eventsPath = path.join(__dirname, 'src/events');

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

  const filePath = path.join(eventsPath, file);

  const event = require(filePath);

  if (event.once) {

    client.once(event.name, (...args) => event.execute(...args, client));

  } else {

    client.on(event.name, (...args) => event.execute(...args, client));

  }

}

const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(chalk.red(`Il file`), chalk.green(`${filePath}`), chalk.red('Non è stato trovato'));
    }
  }
}

client.once('ready', async () => {
  async function refreshBotActivity() {
    const status = await client.user.setPresence({
      status: 'idle',
      activities: [{
        type: ActivityType.Custom,
        name: 'Guardando',
        state: `Proteggendo ${client.guilds.cache.size} Servers`
      }],
    });
  }

  refreshBotActivity();
  setInterval(refreshBotActivity, 60 * 1000);

  require('./commandloader');

  try {
    await mongoose.connect(mongodb || '')
    if (mongoose.connect) {
      console.log(chalk.green('Database connesso!'));
    } else {
      console.log(chalk.red('È stato rilevato un problema nella connessione del database perfavore controlla se gli ip sono in whitelist, e controlla se il link del database e giusto!'));
    }
  } catch (err) {
    console.log(err)
  }


  console.log(chalk.green(`Client connesso con ${client.user.tag}!`));
});




client.on('error', error => {
  console.error('Errore nel bot Discord:', error);
});

client.on('interactionCreate', async (interaction, client) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Command ${interaction.commandName} not found`);
        return;
    }
  
  
    try{
      await command.execute(interaction, client)
    } catch(err) {
      console.log(err)
      await interaction.reply("errore durante l'esecuzione del comando")
  
    }
  }

}),


client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Errore durante l'esecuzione del comando");
  }
}),

client.login(token);