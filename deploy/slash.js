const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('colors')
require('dotenv').config();

const commands = require('./commands');
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('[Discord API] Started refreshing application (/) commands.'.yellow);
		await rest.put(
			// if you want to make your slash commands in all guilds use "applicationCommands("CLIENT_ID")"
			Routes.applicationGuildCommands(process.env.BOTID, process.env.SERVERID),
			{ body: commands },
		);
		console.log('[Discord API] Successfully reloaded application (/) commands.'.green);
		console.log(`[Discord API] Successfully reloaded "${commands.length}" commands.`.green);
	} catch (error) {
		console.error(error);
	}
})();