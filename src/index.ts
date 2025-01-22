import { Client, Collection, Interaction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "fs";
import path, { join } from "path";
import config from "./configs/config.json";
import chalk from "chalk";
import mongoose from "mongoose";

type Command = {
    data: SlashCommandBuilder;
    description: string;
    execute: (interaction: Interaction, client: Client) => void;
};

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

const client = new Client({ intents: ["Guilds"] });
client.commands = new Collection<string, Command>();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = readdirSync(foldersPath);
const commandData: any[] = [];

async function LoadCommandsData() {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".ts"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            try {
                const commandModule = await import(filePath);
                const command = commandModule.default;
                if (command?.data && command?.execute) {
                    client.commands.set(command.data.name, command);
                    commandData.push(command.data.toJSON());
                    console.log(chalk.green("Caricato il comando:"), chalk.blue(file));
                } else {
                    console.log(chalk.red("Il file non è valido:"), chalk.yellow(filePath));
                }
            } catch (err) {
                console.log(chalk.red("Errore nel caricamento del comando"), chalk.green(err));
            }
        }
    }
}

async function LoadCommands() {
    try {
        console.log("Inizio registrazione dei comandi.");
        console.log("Comandi da registrare:", commandData);

        const rest = new REST({ version: "10" }).setToken(config.token);

        const response = await rest.put(Routes.applicationCommands(config.clientId), { body: commandData });
    
    } catch (error) {
        console.error("Errore nella registrazione dei comandi:", error);
    }
}

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
export function loadEvents() {
    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args, client));
        } else {
            client.on(event.default.name, (...args) => event.default.execute(...args, client));
        }

        console.log('Events successfully loaded')
    }
}

const messagesPath = join(__dirname, 'messages');
const messagesFiles = readdirSync(messagesPath).filter(file => file.endsWith('.ts'));
export function loadMessagesCommands() {
    for (const file of messagesFiles) {
        const messagePath = join(messagesPath, file);
        const event = require(messagePath);
        if (event.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.default.execute(...args, client));
        }

        console.log('Messages successfully loaded')
    }
}

client.once("ready", async () => {
    await LoadCommandsData();
    await LoadCommands();
    await loadEvents();
    await loadMessagesCommands();
    try {
        await mongoose.connect(config.mongodb || '');
        console.log('Database connesso!');
      } catch (err) {
        console.log('Database non connesso!', err);
      }
    console.log(chalk.green("Client login avvenuto con successo come"), chalk.blue(client.user!.tag));
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Comando non trovato: ${interaction.commandName}`);
        await interaction.reply({ content: "Comando non trovato.", ephemeral: true });
        return;
    }
    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`Errore durante l'esecuzione del comando: ${error}`);
        await interaction.reply({ content: "Si è verificato un errore.", ephemeral: true });
    }
});

client.login(config.token);
