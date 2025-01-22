import { Interaction, Client, EmbedBuilder, Events } from "discord.js";
import userSchema from '../typings/schemas/userSchema'

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    try { 

      const userSchemaData = await userSchema.findOne({ UserID: interaction.user.id})

      if (!userSchemaData) {
        await userSchema.create({
        UserID: interaction.user.id,
        HyperCoins: 100,
        Bio: "Nuovo Utente",
        Title: "",
        Privacy: false,
        Admin: false,
        Theme: "Default",
        Language: ""
    })
      }
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
