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
                interaction.reply('Commands to use:\n' +
                    '- /about\n' +
                    '- /partner\n' +
                    '- /create\n' +
                    '- /help\n' +
                    '- /help {command}');
            } else {
                let command = interaction.options.get('command');
                switch (command.value) {
                    case 'create':
                        interaction.reply('' +
                            'Command create has 2 arguments:\n' +
                            '- Project name\n' +
                            '- Users (divide by space)\n' +
                            'Example: /create Project-Name @User1 @User2 @User3'
                        );
                        break;
                    case 'partner':
                        interaction.reply('' +
                            'Command partner has 1 argument:\n' +
                            '- User\n' +
                            'Example: /partner @User'
                        );
                        break;
                    default:
                        interaction.reply('Command not found.');
                }
            }
            break;
        case 'create':
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
                    interaction.editReply({
                        content: 'Role created successfully.'
                    });

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
                    interaction.editReply({
                        content: 'Roles assigned successfully.'
                    });

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

                            interaction.editReply({
                                content: `Project ${projectName} created successfully.`
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            interaction.editReply({
                                content: 'An error occurred.'
                            })
                        });
                })
                .catch(error => {
                    console.log(error);
                    interaction.editReply({
                        content: 'An error occurred.'
                    })
                });
            break;
        case 'partner':
            let user = interaction.options.get('user').value;

            interaction.reply('Creating partnership with ' + user);
            interaction.guild.channels.create({
                name: 'chat-' + user,
                type: 0,
                parent: '1153293334878629899',
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel,
                        ],
                    },
                    {
                        id: user,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                        ],
                    },
                ],
            }).then(() => {
                interaction.editReply({
                    content: 'Partnership created successfully.'
                });
            }).catch(error => {
                console.log(error);
                interaction.editReply({
                    content: 'An error occured.'
                });
            });
            break;
        default:
            interaction.reply('Invalid command. See /help for more information.');
    }
});

client.login(token)
    .then(() => console.log('Bot ' + client.user.username + ' started successfully.'))
    .catch(error => console.log(error));
