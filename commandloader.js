const config = require('./src/configs/config')
const { REST, Routes } = require('discord.js');
const token = config.token;
const clientId = config.clientID;
const fs = require('node:fs');
const chalk = require('chalk');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		 const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		 for (const file of commandFiles) {
				 const filePath = path.join(commandsPath, file);
				 const command = require(filePath);
				 if ('data' in command && 'execute' in command) {
						 commands.push(command.data.toJSON());
				 } else {
						 console.log(chalk.red('il file'), chalk.blue(`${filePath}`), chalk.red('Non è stato trovato'));
				 }
		 }
 }

 const rest = new REST().setToken(token);

 (async () => {
		 try {
				 console.log(chalk.red('Sto caricando'), chalk.green(`${commands.length}`), chalk.red('comandi...'));
				 const data = await rest.put(
						 Routes.applicationCommands(clientId),
						 { body: commands },
				 );

				 console.log(chalk.green('Ho caricato'), chalk.red(`${data.length}`), chalk.green('comandi.'));
		 } catch (error) {
				 console.error(error);
		 }
 })();
