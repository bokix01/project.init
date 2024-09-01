const { Client, PermissionsBitField, IntentsBitField, ActivityType } = require('discord.js');
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
   console.log('Bot ' + client.user.username + ' is ready to use.');

   client.user.setActivity({
       name: 'xiko',
       type: ActivityType.Listening
   });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.bot) return;
    let projectName;
    let users;

    switch (interaction.commandName) {
        case 'about':
            interaction.reply({embeds: [aboutBotEmbed]});
            break;
        case 'help':
            if (!interaction.options.data[0]) {
                interaction.reply('Commands to use:\n' +
                    '`/about`\n' +
                    '`/partner`\n' +
                    '`/create`\n' +
                    '`/add`\n' +
                    '`/help`\n' +
                    '`/help {command}`');
            } else {
                let command = interaction.options.get('command');
                switch (command.value) {
                    case 'create':
                        interaction.reply('' +
                            'Command `/create` has 2 arguments:\n' +
                            '- Project name\n' +
                            '- Users (divide by space)\n' +
                            'Example: `/create Project-Name @User1 @User2 @User3`'
                        );
                        break;
                    case 'add':
                        interaction.reply('' +
                            'Command `/add` has 2 arguments:\n' +
                            '- Project name\n' +
                            '- Users (divide by space)\n' +
                            'Example: `/add Project-Name @User1 @User2 @User3`'
                        );
                        break;
                    case 'partner':
                        interaction.reply('' +
                            'Command `/partner` has 1 argument:\n' +
                            '- User\n' +
                            'Example: `/partner @User`'
                        );
                        break;
                    default:
                        interaction.reply('Command not found.');
                }
            }
            break;
        case 'create':
            projectName = interaction.options.get('project-name').value;
            users = interaction.options.get('users').value.trim().split(/ +/g);

            try {
                interaction.reply('' +
                    'Project name: ' + projectName + '\n' +
                    'User IDs: ' + users
                );

                const role = await interaction.guild.roles.create({
                    name: projectName,
                    reason: 'New project',
                });

                for (let user of users) {
                    if (user.startsWith('<@') && user.endsWith('>')) {
                        user = user.slice(2, -1);
                        if (user.startsWith('!')) {
                            user = user.slice(1);
                        }

                        const member = await interaction.guild.members.fetch(user);
                        await member.roles.add([role, await interaction.guild.roles.cache.get('1273387215233351703')]);
                    }
                }

                const category = await interaction.guild.channels.create({
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
                });
                await interaction.guild.channels.create({
                    name: '💬︱chat',
                    type: 0,
                    parent: category.id,
                });

                await interaction.guild.channels.create({
                    name: '🔊︱voicechat',
                    type: 2,
                    parent: category.id,
                });

            } catch (error) {
                console.log(`An error occurred.\n${error}`);
                interaction.reply('An error occurred.');
            }
            break;
        case 'add':
            projectName = interaction.options.get('project-name').value;
            users = interaction.options.get('users').value.trim().split(/ +/g);

            try {
                for (let user of users) {
                    if (user.startsWith('<@') && user.endsWith('>')) {
                        user = user.slice(2, -1);
                        if (user.startsWith('!')) {
                            user = user.slice(1);
                        }

                        const project = await interaction.guild.roles.cache.find(role => role.name === projectName);
                        if (project !== undefined) {
                            const member = await interaction.guild.members.fetch(user);
                            await member.roles.add([project, await interaction.guild.roles.cache.get('1273387215233351703')]);

                            interaction.reply('' +
                                'Project name: ' + projectName + '\n' +
                                'User IDs: ' + users
                            );
                        } else {
                            interaction.reply('There is currently no project under that name.');
                            break;
                        }
                    }
                }
            } catch (error) {
                console.log(`An error occurred.\n${error}`);
                interaction.reply('An error occurred.');
            }
            break;
        case 'partner':
            try {
                let user = interaction.options.get('user').value;

                await interaction.guild.channels.create({
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
                });

                const member = await interaction.guild.members.fetch(user);
                await member.roles.add(await interaction.guild.roles.cache.get('1154357057688965200'));

                interaction.reply('Creating partnership with ' + user);
            } catch(error) {
                console.log(`An error occurred.\n${error}`);
                interaction.reply('An error occured.');
            }
            break;
        default:
            interaction.reply('Invalid command. See /help for more information.');
    }
});

client.login(token)
    .then(() => console.log('Bot ' + client.user.username + ' started successfully.'))
    .catch(error => console.log(error));
