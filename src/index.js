const { Client, PermissionsBitField, IntentsBitField } = require('discord.js');
require('dotenv').config();
const { aboutBotEmbed } = require('./embeds');

const token = process.env.TOKEN;

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', () => {
   console.log('Bot ' + client.user.username + ' is ready to use.')
});

client.on('interactionCreate', interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.bot) return;

    switch (interaction.commandName) {
        case 'about':
            interaction.reply({ embeds: [aboutBotEmbed] });
            break;
        case 'help':
            if (!interaction.options.data[0]) {
                interaction.reply('Commands to use:\n- /help create');
            } else {
                let command = interaction.options.get('command');
                switch (command.value) {
                    case 'create':
                        interaction.reply('' +
                            'Command create has 2 arguments:\n' +
                            '- Project name\n' +
                            '- Users (divide by space)\n' +
                            'Example: create Project-Name @User1 @User2 @User3'
                        );
                        break;
                    default:
                        interaction.reply('Command not found.');
                }
            }
            break;
        case 'create':
            if (!interaction.options.data[1]) {
                interaction.reply('Not enough arguments. See /help for more information.');
            } else {
                let projectName = interaction.options.get('project-name').value;
                let users = interaction.options.get('users').value.trim().split(/ +/g);

                interaction.reply('' +
                    'Project name: ' + projectName + '\n' +
                    'User IDs: ' + users
                );

                interaction.guild.roles.create({
                    name: projectName,
                    reason: 'New project',
                })
                    .then(role => {
                        interaction.channel.send('Role created successfully.');

                        users.forEach(user => {
                            if (user.startsWith('<@') && user.endsWith('>')) {
                                user = user.slice(2, -1);
                                if (user.startsWith('!')) {
                                    user = user.slice(1);
                                }

                                interaction.guild.members.fetch(user)
                                    .then(member => {
                                        member.roles.add(role)
                                    });
                            }
                        });

                        interaction.channel.send('Roles assigned successfully.');

                        interaction.guild.channels.create({
                            name: projectName,
                            type: 4,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone.id,
                                    deny: [
                                        PermissionsBitField.Flags.ViewChannel,
                                    ],
                                },
                                {
                                    id: role.id,
                                    allow: [
                                        PermissionsBitField.Flags.ViewChannel,
                                    ],
                                },
                            ],
                        })
                            .then(category => {
                                interaction.guild.channels.create({
                                    name: '💬︱chat',
                                    type: 0,
                                    parent: category.id,
                                });

                                interaction.guild.channels.create({
                                    name: '🔊︱voicechat',
                                    type: 2,
                                    parent: category.id,
                                });

                                interaction.channel.send('Category created successfully.');
                            })
                            .catch(error => {
                                interaction.channel.send('An error occurred.');
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        interaction.channel.send('An error occurred.');
                        console.log(error);
                    });
            }
            break;
        default:
            interaction.reply('Invalid command. See /help for more information.');
    }
});

client.login(token)
    .then(() => console.log('Bot ' + client.user.username + ' started successfully.'))
    .catch(error => console.log(error));
