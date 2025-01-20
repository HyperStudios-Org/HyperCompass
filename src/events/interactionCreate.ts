import { Interaction, Client, EmbedBuilder, Events } from "discord.js";

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    try { 
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          console.error(`Comando non trovato: ${interaction.commandName}`);
          await interaction.reply({
            content: "Comando non trovato.",
            ephemeral: true,
          });
          return;
        }
    
        await command.execute(interaction, client);
      }
    } catch (error) {
      console.error(`Errore nell'esecuzione del comando: ${error}`);
    }
  },
};
