const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "button",
    description: "Create discord buttons when user click them give them a role.",
    options: [
        {
            name: "create",
            description: "Create a button",
            type: 1,
            options: [
                {
                    name: "style",
                    description: "Style of the button.",
                    type: 3,
                    choices: [
                        {
                            name: "Blue",
                            value: "PRIMARY"
                        },
                        {
                            name: "Gray",
                            value: "SECONDARY"
                        },
                        {
                            name: "Green",
                            value: "SUCCESS"
                        },
                        {
                            name: "Red",
                            value: "DANGER"
                        }
                    ],
                    required: true
                },
                {
                    name: "label",
                    description: "The label of button.",
                    type: 3,
                    required: true
                },
                {
                    name: "role",
                    description: "The role when user click the button",
                    type: 8,
                    required: true
                },
                {
                    name: "content",
                    description: "The content of message.",
                    type: 3,
                    required: true
                },
                {
                    name: "emoji",
                    description: "Emoji of button",
                    type: 3
                },
                {
                    name: "channel",
                    description: "Channel you want to send button to.",
                    type: 7,
                    channel_types: [0, 5]
                }
            ],
        },
        {
            name: "edit",
            description: "Edit an exits message button.",
            type: 1,
            options: [
                {
                    name: "message_id",
                    description: "The message id of message you want to edit.",
                    type: 3,
                    required: true
                },
                {
                    name: "new_style",
                    description: "Edit style of the button.",
                    type: 3,
                    choices: [
                        {
                            name: "Blue",
                            value: "PRIMARY"
                        },
                        {
                            name: "Gray",
                            value: "SECONDARY"
                        },
                        {
                            name: "Green",
                            value: "SUCCESS"
                        },
                        {
                            name: "Red",
                            value: "DANGER"
                        }
                    ]
                },
                {
                    name: "new_label",
                    description: "Edit label of the button.",
                    type: 3
                },
                {
                    name: "new_role",
                    description: "Edit role given of the button.",
                    type: 8
                },
                {
                    name: "new_content",
                    description: "Edit content of the button.",
                    type: 3
                },
                {
                    name: "new_emoji",
                    description: "Edit emoji of the button.",
                    type: 3
                }
            ]
        }
    ],
    permission: "ADMINISTRATOR",
    run: async(interaction, client) => {
        const style = interaction.options.getString('style');
        const label = interaction.options.getString('label');
        const role = interaction.options.getRole('role');
        const content = interaction.options.getString('content');
        const emoji = interaction.options.getString('emoji') || null;
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const buttonLimits = {
            label: 80,
            content: 2000
        };
        if (label.length > buttonLimits.label) {
            return interaction.reply({
                content: `:x: Label must be lower than **${buttonLimits.label}** characters.`,
                ephemeral: true
            }).catch(e => {});
        }
        if (content.length > buttonLimits.content) {
            return interaction.reply({
                content: `:x: Content must be lower than **${buttonLimits.content}** characters.`,
                ephemeral: true
            }).catch(e => {});
        }
        if (role.managed) {
            return interaction.reply({
                content: `:x: **${role.name}** is managed by integration and can't be given.`,
                ephemeral: true
            }).catch(e => {});
        }
        if (!channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) {
            return interaction.reply({
                content: `:x: I dont't have permissions to send message in ${channel} channel.`,
                ephemeral: true
            }).catch(console.error)
        }
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('role_button')
            .setLabel(label)
            .setStyle(style)
            .setEmoji(emoji)
        )
        const msg = await channel.send({
            content: content,
            components: [row]
        }).catch(e => {});
        await client.db.push('buttons', interaction.guild.id, {
            message: msg.id,
            role: role.id
        });
        interaction.reply({
            content: `**✅ button has been sent to ${channel} channel.**`
        }).catch(e => console.error);
    }
}