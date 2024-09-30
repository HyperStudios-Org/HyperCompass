const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    InteractionType 
} = require('discord.js');
const clubSchema = require('../../schemas/clubSchema'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('club')
        .setDescription('Gestisci il tuo club')
        .addSubcommand(command => 
            command
                .setName('create')
                .setDescription('Crea un club')
        )
        .addSubcommand(command => 
            command
                .setName('edit')
                .setDescription("Modifica le impostazioni del club")
                .addStringOption(option => 
                    option
                        .setName('club')
                        .setDescription('Inserisci il nome o l\'ID del club')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(command => 
            command
                .setName('delete')
                .setDescription('Elimina il tuo club')
        )
        .addSubcommand(command => 
            command
                .setName('setup')
                .setDescription("Imposta il server del tuo club")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {

            const modal = new ModalBuilder()
                .setCustomId('create_club_modal')
                .setTitle('Crea un Club');

            const clubNameInput = new TextInputBuilder()
                .setCustomId('club_name')
                .setLabel('Club Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const clubDescriptionInput = new TextInputBuilder()
                .setCustomId('club_description')
                .setLabel('Club Description')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow1 = new ActionRowBuilder().addComponents(clubNameInput);
            const actionRow2 = new ActionRowBuilder().addComponents(clubDescriptionInput);

            modal.addComponents(actionRow1, actionRow2);

       
            await interaction.showModal(modal);

      
            const filter = (i) => i.customId === 'create_club_modal' && i.user.id === interaction.user.id;

    
            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(err => null);

            if (!modalInteraction) {
                return await interaction.followUp('Tempo scaduto! Riprova a creare il club.');
            }

      
            const clubName = modalInteraction.fields.getTextInputValue('club_name');
            const clubDescription = modalInteraction.fields.getTextInputValue('club_description');

     
            const randomNum = Math.floor(1000 + Math.random() * 9000); 
            const clubID = `cb-${clubName.slice(0, 3)}${randomNum}`; 

          
            await clubSchema.create ({
                ClubName: clubName,
                ClubID: clubID,
                ClubDescription: clubDescription,
                Points: 100,
                Rank: 'Default',
                Ruoli: [],
                Member: [],
                ActiveQuests: [],
                GuildID: '',
                LogChannel: ''
            });
            try{
                await modalInteraction.reply(`Club "${clubName}" creato con successo! ID del club: ${clubID}`);
            } catch (error) {
                console.error(error);
                await modalInteraction.reply('Si è verificato un errore durante la creazione del club.');
            }
        }
    }
};
