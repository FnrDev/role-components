const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const mysql = require('mysql-database');
const database = new mysql();
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.aliases = new Discord.Collection();
require('dotenv').config();

['hanlders', 'events'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

(async () => {
    let db = await database.connect({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.USER,
        database: process.env.database
    });
    db.on('connected', () => {
      console.log('Database Connected.');
      client.db = db;
      db.create("buttons");
    })
})();

client.login(process.env.TOKEN);