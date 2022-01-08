const { MessageActionRow, MessageButton, Util, MessageEmbed } = require('discord.js');
const buttonOptions = require('../../deploy');

module.exports = {
    name: "button",
    description: "Create discord buttons when user click them give them a role.",
    options: buttonOptions,
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
            if (emoji) {
                const parseEmoji = Util.parseEmoji(emoji);
                if (!parseEmoji.id) {
                    return interaction.reply({
                        content: `:x: You must send vaild emoji`,
                        ephemeral: true
                    }).catch(console.error)
                }
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
                channel: channel.id,
                guild: interaction.guild.id
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
                const buttonData = await client.db.get('buttons', message).catch(console.error);
                buttonData['role'] = newRole.id;
                await client.db.set('buttons', fetchMessages.id, buttonData)
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
            return interaction.reply({
                content: `✅ button successfully updated [View Message](${fetchMessages.url})`
            }).catch(console.error);
        }
        // Delete command
        if (interaction.options.getSubcommand() === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const getData = await client.db.get('buttons', messageId);
            if (!getData) {
                return interaction.reply({
                    content: `:x: I can\'t find message data.`,
                    ephemeral: true
                }).catch(console.error);
            }
           const message = await interaction.guild.channels.cache.get(getData.channel).messages.fetch(getData.message);
           await client.db.delete('buttons', messageId);
           await message.delete();
           interaction.reply({
               content: `✅ Message has been deleted successfully.`
           }).catch(console.error)
        }
        // List command
        if (interaction.options.getSubcommand() === 'list') {
            const channel = interaction.options.getChannel('filter_by_channel');
            const role = interaction.options.getRole('filter_by_role');
            const allButons = await client.db.all("buttons");
            if (channel) {
                const filterByChannel = allButons.filter(r => r.data.guild === interaction.guild.id && r.data.channel === channel.id);
                if (!filterByChannel.length) {
                    return interaction.reply({
                        content: ":x: There are no buttons in this channel.",
                        ephemeral: true
                    })
                }
                let totalButtons = 0;
                let pushString = '';
                filterByChannel.forEach(button => {
                    totalButtons++
                    pushString += `**#${totalButtons}** - [View Message](https://discord.com/channels/${interaction.guild.id}/${button.data.channel}/${button.data.message}) - **Role:** <@&${button.data.role}> - **Channel:** <#${button.data.channel}>\n`
                })
                const embed = new MessageEmbed()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(pushString)
                .setColor(interaction.guild.me.displayHexColor)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                return interaction.reply({
                    embeds: [embed]
                })
            }
            if (role) {
                const filterByRole = allButons.filter(r => r.guild === interaction.guild.id && r.data.role === role.id);
                if (!filterByRole.length) {
                    return interaction.reply({
                        content: ":x: There are no buttons in this channel.",
                        ephemeral: true
                    })
                }
                let totalRole = 0;
                let pushFilterRole = '';
                filterByRole.forEach(button => {
                    totalRole++
                    pushFilterRole += `**#${totalRole}** - [View Message](https://discord.com/channels/${interaction.guild.id}/${button.data.channel}/${button.data.message}) - **Role:** <@&${button.data.role}> - **Channel:** <#${button.data.channel}>\n`
                });
                const embed = new MessageEmbed()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(pushFilterRole)
                .setColor(interaction.guild.me.displayHexColor)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                return interaction.reply({
                    embeds: [embed]
                })
            }
            const filterGuildButtons = allButons.filter(r => r.data.guild === interaction.guild.id);
            if (!filterGuildButtons) {
                return interaction.reply({
                    content: ":x: There are no button messages in this server.",
                    ephemeral: true
                })
            }
            let loopButtons = '';
            let num = 0;
            filterGuildButtons.forEach(button => {
                num++
                loopButtons += `**#${num}** - [View Message](https://discord.com/channels/${interaction.guild.id}/${button.data.channel}/${button.data.message}) - **Role:** <@&${button.data.role}> - **Channel:** <#${button.data.channel}>\n`
            });
            const embed = new MessageEmbed()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(loopButtons)
            .setColor(interaction.guild.me.displayHexColor)
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            interaction.reply({
                embeds: [embed]
            })
        }
    }
}