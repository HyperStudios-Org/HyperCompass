const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder,
    ActionRowBuilder ,
    ButtonBuilder,
    ButtonStyle
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

            const ownerId = interaction.user.id;

            const newClub = await clubSchema.create({
                ClubName: clubName,
                ClubID: clubID,
                ClubDescription: clubDescription,
                Points: 100,
                Rank: "Default",
                Ruoli: [{ UserID: ownerId, Role: 'Ownership' }],  
                Member: [],
                ActiveQuests: [],
                GuildID: '',
                LogChannel: ''
            });

            try {
                const embed = new EmbedBuilder()
                    .setTitle('Club creato con successo!')
                    .setColor('Green')
                    .addFields(
                        { name: '**<:HY_home:1280658819164410030> Nome Club**', value: `${newClub.ClubName}`, inline: true },
                        { name: '**<:HY_link:1280661051683373076> Club ID**', value: `${newClub.ClubID}`, inline: true },
                        { name: ' ', value: ` `, inline: false},
                        { name: '**<:coins:1290762555312181331> Punti Club**', value: `${newClub.Points}`, inline: true },
                        { name: '**<:flame:1290761217505362061> Rank Club**', value: `${newClub.Rank}`, inline: true },
                        { name: '**<:HY_File:1291057521359982643> Descrizione Club**', value: `${newClub.ClubDescription}` },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 })) 
                    .setImage("https://media.discordapp.net/attachments/1279883921810522202/1290695776070008912/Green_Action_Completed.png?ex=66fd659c&is=66fc141c&hm=bc15919905efeb4609ce7bcfea3c6ac303fc549105ad3fd5f4a3bc25c058ffcb&=&format=webp&quality=lossless")

                await modalInteraction.reply({ embeds: [embed] });

            } catch (error) {
                console.error(error);
                await modalInteraction.reply('Si è verificato un errore durante la creazione del club.');
            }
        }
        
        if (subcommand === 'edit') {
            const clubID = interaction.options.getString('club'); 
            const userId = interaction.user.id;
        

            const club = await clubSchema.findOne({ ClubID: clubID });
        
            if (!club) {
                return interaction.reply('Club non trovato. Assicurati di inserire il nome o l\'ID corretto.');
            }
        
  
            const ownershipRole = club.Ruoli.find(role => role.Role === 'Ownership');
        
            if (!ownershipRole) {
                return interaction.reply('Non è stato trovato nessun utente con il ruolo Ownership in questo club.');
            }
        

            const ownerUser = await interaction.client.users.fetch(ownershipRole.UserID);
        

            const userRole = club.Ruoli.find(role => role.UserID === userId);
        
            if (userRole && (userRole.Role === 'Ownership' || userRole.Role === 'Admin')) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle("Impostazioni Club")
                        .setDescription(
                            `Qua sotto sono riportate le impostazioni del club\n\n` +
                            `<:HY_Ping:1291053678244921495> **Nome Club:** \`${club.ClubName}\`\n` +
                            `<:HY_File:1291057521359982643> **Descrizione Club:** \`${club.ClubDescription}\`\n` +
                            `<:HY_Yellow_Key:1291485943663956020> **Ownership:** <@${ownerUser.id}> / \`${ownerUser.tag}\``
                        )
                        
                        .setColor('#2b2d31');

                       const buttons = new ActionRowBuilder()
                       .addComponents(
                        button = new ButtonBuilder()
                        .setCustomId(`description_${club.ClubID}`)
                        .setLabel('Modifica Descrizione Club')
                        .setStyle(ButtonStyle.Secondary),

                        button2 = new ButtonBuilder()
                        .setCustomId(`ownership_${club.ClubID}`)
                        .setLabel('Trasferisci Ownership')
                        .setStyle(ButtonStyle.Secondary),

                        button3 = new ButtonBuilder()
                        .setCustomId(`delete_${club.ClubID}`)
                        .setLabel('<:red_trash_HY:1291051041944502367> Elimina Club')
                        .setStyle(ButtonStyle.Danger)
                       )
        
                    await interaction.reply({ embeds: [embed], components: [buttons] });
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Si è verificato un errore durante la modifica del club.');
                }
            } else {
                return interaction.reply('Non hai i permessi per modificare questo club.');
            }
        }
    }}        