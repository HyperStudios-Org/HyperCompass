import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction} from "discord.js";
import { MongoBatchReExecutionError } from "mongodb";
import userSchema from '../../typings/schemas/userSchema'

export default {
    data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show user profile')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user')
        const userSchemaData = await userSchema.findOne({ user: interaction.user.id })
        
                                                                
        if (user == null) {
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
                const embed = new EmbedBuilder()
                .setTitle(`**__Profilo di ${user!.username}`)
                .setDescription(``)
            }
        }
    }
}

/*    UserID: String,
    HyperCoins: Number,
    Bio: String,
    Title: String,
    Privacy: Boolean,
    Admin: Boolean,
    Theme: String,
    Language: String */