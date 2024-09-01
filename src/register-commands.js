require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'about',
        description: 'Display information about this bot.',
    },
    {
        name: 'help',
        description: 'Help with bot usage',
        options: [
            {
                name: 'command',
                description: 'Command you are seeking help for.',
                type: 3,
            },
        ]
    },
    {
        name: 'create',
        description: 'Create project',
        options: [
            {
                name: 'project-name',
                description: 'Name for project to be created.',
                type: 3,
                required: true,
            },
            {
                name: 'users',
                description: 'All users to add to the project.',
                type: 3,
                required: true,
            },
        ]
    },
    {
        name: 'add',
        description: 'Add to project',
        options: [
            {
                name: 'project-name',
                description: 'Name for project to add users in.',
                type: 3,
                required: true,
            },
            {
                name: 'users',
                description: 'All users to add to the project.',
                type: 3,
                required: true,
            },
        ]
    },
    {
        name: 'partner',
        description: 'Partner up with someone',
        options: [
            {
                name: 'user',
                description: 'User to partner up with.',
                type: 6,
                required: true,
            },
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering / commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIEND_ID, process.env.GUILD_ID),
            {
                body: commands
            }
        );

        console.log('Commands registered successfully.');
    } catch (error) {
        console.log(error);
    }
})();
