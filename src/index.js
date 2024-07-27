const { Client, PermissionsBitField, IntentsBitField } = require('discord.js');
require('dotenv').config();

const token = process.env.TOKEN;
const prefix = '>';

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

client.on('messageCreate', message => {
    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }

    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice(prefix.length).toLowerCase();

    switch (cmd) {
        case 'help':
            if (!args[1]) {
                message.reply('Commands to use:\n- >help create');
            } else if (args[1] === 'create') {
                message.reply('' +
                    'Command create has 2 arguments:\n' +
                    '- Project name\n' +
                    '- Users (divide by space)\n' +
                    'Example: create Project-Name @User1 @User2 @User3'
                );
            } else if (args[2]) {
                message.reply('Too many arguments.');
            }
            break;
        case 'create':
            if (!args[2]) {
                message.reply('Not enough arguments. See >help for more information.');
            } else {
                let projectName = args[1];
                let userIDs = message.mentions.users;
                message.reply('' +
                    'Project name: ' + projectName + '\n' +
                    'User IDs: ' + args.slice(2)
                );
                message.guild.roles.create({
                    name: projectName,
                    reason: 'New project',
                })
                    .then(role => {
                        message.channel.send('Role created successfully.');

                        userIDs.forEach(id => {
                            message.guild.members.fetch(id)
                                .then(member => {
                                    member.roles.add(role)
                                });
                        });
                        message.channel.send('Roles assigned successfully.');

                        message.guild.channels.create({
                            name: projectName,
                            type: 4,
                            permissionOverwrites: [
                                {
                                    id: message.guild.roles.everyone.id,
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
                                message.guild.channels.create({
                                    name: '💬︱chat',
                                    type: 0,
                                    parent: category.id,
                                });

                                message.guild.channels.create({
                                    name: '🔊︱voicechat',
                                    type: 2,
                                    parent: category.id,
                                });

                                message.channel.send('Category created successfully.');
                            })
                            .catch(error => {
                                message.channel.send('An error occurred.');
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        message.channel.send('An error occurred.');
                        console.log(error);
                    });
            }
            break;
        default:
            message.reply('Invalid command. See >help for more information.');
    }
});

client.login(token)
    .then(() => console.log('Bot ' + client.user.username + ' started successfully.'))
    .catch(error => console.log(error));
