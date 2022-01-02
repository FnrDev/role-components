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
        // Create command
        if (interaction.options.getSubcommand() === 'create') {
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
            await client.db.set('buttons', msg.id, {
                message: msg.id,
                role: role.id,
                channel: channel.id
            });
            return interaction.reply({
                content: `**✅ button has been sent to ${channel} channel.**`
            }).catch(e => console.error);
        }
        // Edit command
        if (interaction.options.getSubcommand() === 'edit') {
            const message = interaction.options.getString('message_id');
            const newStyle = interaction.options.getString('new_style');
            const newLabel = interaction.options.getString('new_label');
            const newRole = interaction.options.getRole('new_role');
            const newContent = interaction.options.getString('new_content');
            const newEmoji = interaction.options.getString('new_emoji');
            const getButtonChannel = await client.db.get('buttons', message);
            if (!getButtonChannel) {
                return interaction.reply({
                    content: `:x: There are no data for this message.`,
                    ephemeral: true
                }).catch(console.error)
            }
            const cacheChannel = interaction.guild.channels.cache.get(getButtonChannel.channel);
            if (!cacheChannel) {
                return interaction.reply({
                    content: `:x: i can\'t find channel with this id, **${getButtonChannel.channel}**`,
                    ephemeral: true
                }).catch(console.error);
            }
            const fetchMessages = await cacheChannel.messages.fetch(getButtonChannel.message).catch(console.error);
            console.log(fetchMessages)
            if (fetchMessages.author.id !== client.user.id) {
                return interaction.reply({
                    content: `i can\'t edit message was sent by another user.`,
                    ephemeral: true
                }).catch(console.error);
            }
            // edit button style
            if (newStyle) {
                const editStyleRow = fetchMessages.components[0]
                editStyleRow.setComponents(
                    new MessageButton()
                    .setCustomId('role_button')
                    .setLabel(fetchMessages.components[0].components[0].label)
                    .setStyle(newStyle)
                    .setEmoji(fetchMessages.components[0].components[0].emoji)
                )
                await fetchMessages.edit({
                    components: [editStyleRow]
                }).catch(console.error);
            }
            // edit button label
            if (newLabel) {
                if (newLabel.length > buttonLimits.label) {
                    return interaction.reply({
                        content: `:x: Label must be lower than **${buttonLimits.label}** characters.`,
                        ephemeral: true
                    }).catch(e => {});
                }
                const editLabelRow = fetchMessages.components[0]
                editLabelRow.setComponents(
                    new MessageButton()
                    .setCustomId('role_button')
                    .setLabel(newLabel)
                    .setStyle(fetchMessages.components[0].components[0].style)
                    .setEmoji(fetchMessages.components[0].components[0].emoji)
                )
                fetchMessages.edit({
                    components: [editLabelRow]
                }).catch(console.error);
            }
            // edit button role
            if (newRole) {
                const buttonData = await client.db.get('buttons', interaction.guild.id).catch(console.error);
                if (!buttonData) {
                    return interaction.reply({
                        content: `:x: There are no button data in this server.`,
                        ephemeral: true
                    }).catch(console.error)
                }
                const findMessage = buttonData.find(r => r.message === fetchMessages.id);
                if (!findMessage) {
                    return interaction.reply({
                        content: `:x: There are no button data in this server.`,
                        ephemeral: true
                    }).catch(console.error)
                }
                findMessage['role'] = newRole.id;
                await client.db.push('buttons', interaction.guild.id, findMessage);
            }
            // edit new content
            if (newContent) {
                if (newContent.length > buttonLimits.content) {
                    return interaction.reply({
                        content: `:x: Content must be lower than **${buttonLimits.content}** characters.`,
                        ephemeral: true
                    }).catch(e => {});
                }
                await fetchMessages.edit({ content: newContent });
            }
            // edit button emoji
            if (newEmoji) {
                const editEmojiRow = fetchMessages.components[0]
                editEmojiRow.setComponents(
                    new MessageButton()
                    .setCustomId('role_button')
                    .setLabel(fetchMessages.components[0].components[0].label)
                    .setStyle(fetchMessages.components[0].components[0].style)
                    .setEmoji(newEmoji)
                )
                await fetchMessages.edit({
                    components: [editEmojiRow]
                }).catch(console.error);
            }
            interaction.reply({
                content: `✅ button successfully updated [View Message](${fetchMessages.url})`
            }).catch(console.error);
        }
    }
}