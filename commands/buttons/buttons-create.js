const { MessageActionRow, MessageButton, Util } = require('discord.js');

module.exports = {
    name: "create",
    run: async(interaction, client) => {
        // get all command options
        const type = interaction.options.getString('type');
        const style = interaction.options.getString('style');
        const label = interaction.options.getString('label');
        const role = interaction.options.getRole('role');
        const content = interaction.options.getString('content');
        const emoji = interaction.options.getString('emoji') || null;
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // buttons limits
        const buttonLimits = {
            label: 80,
            content: 2_000
        };

        // validations
        if (label.length > buttonLimits.label) {
            return interaction.reply({
                content: `:x: Label must be lower or equal than **${buttonLimits.label}** characters.`,
                ephemeral: true
            })
        }

        if (content.length > buttonLimits.content) {
            return interaction.reply({
                content: `:x: Content must be lower or equal than **${buttonLimits.content}** characters.`,
                ephemeral: true
            })
        }

        if (role.managed) {
            return interaction.reply({
                content: `:x: **${role.name}** is managed by integration and can\'t be given.`,
                ephemeral: true
            })
        }

        // check if bot has permissions in channel
        if (!channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) {
            return interaction.reply({
                content: `:x: I don\'t have permissions to send message in ${channel} channel.`,
                ephemeral: true
            })
        }

        // create row with button component
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('role_button')
            .setLabel(label)
            .setStyle(style)
            .setEmoji(emoji)
        )

        // send components to channel
        const msg = await channel.send({
            content,
            components: [row]
        });

        // set message data into database
        await client.db.set('buttons', msg.id, {
            message: msg.id,
            role: role.id,
            channel: channel.id,
            guild: interaction.guild.id,
            action: type
        });

        // reply to interaction
        interaction.reply({
            content: `**✅ button has been sent to ${channel} channel. [View Message](<${msg.url}>)**`
        })
    }
}