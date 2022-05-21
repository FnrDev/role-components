const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "list",
    run: async(interaction, client) => {
        // get all saved buttons from database
        const allButtons = await client.db.all("buttons");

        // filter buttons for the guild only
        const filterButtons = allButtons.filter((button) => button.data.guild === interaction.guildId);

        // check if there buttons in the server.
        if (!filterButtons.length) {
            return interaction.reply({
                content: ':x: There are no buttons in this channel.',
                ephemeral: true
            })
        }

        // the string will send to user
        let message = '';

        // map all buttons
        filterButtons.map((button, index) => {
            message += `**#${index + 1}** - [View Message](https://discord.com/channels/${interaction.guild.id}/${button.data.channel}/${button.data.message}) - **Role:** <@&${button.data.role}> - **Channel:** <#${button.data.channel}>\n`
        });

        // create embed
        const embed = new MessageEmbed()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setDescription(message)
        .setColor(interaction.guild.me.displayHexColor)
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()

        interaction.reply({
            embeds: [embed]
        })
    }
}