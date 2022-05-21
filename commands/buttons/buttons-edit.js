const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "edit",
    run: async(interaction, client) => {
        const messageId = interaction.options.getString('message_id');
        const label = interaction.options.getString('label');
        const style = interaction.options.getString('style');
        const role = interaction.options.getRole('role');
        const content = interaction.options.getString('content');
        const emoji = interaction.options.getString('emoji');

        const buttonLimits = {
            label: 80,
            content: 2_000
        }

        // get button data
        const getButton = await client.db.get('buttons', messageId);
        if (!getButton) {
            return interaction.reply({
                content: ':x: There are no data for this message.',
                ephemeral: true
            })
        }

        // find channel and check if channel is not deleted
        const getButtonChannel = interaction.guild.channels.cache.get(getButton.channel);
        if (!getButtonChannel) {
            return interaction.reply({
                content: `:x: I can\`t find channel with id \`${getButton.channel}\``,
                ephemeral: true
            })
        }

        // fetch the message in case it's not in cache
        const fetchMessage = await getButtonChannel.messages.fetch(getButton.message).catch(() => false);
        if (!fetchMessage) {
            return interaction.reply({
                content: `:x: I can\'t find message with id \`${getButton.message}\``,
                ephemeral: true
            })
        }

        // check if style option has been seleted and edit the button with new style
        if (style) {
            const editStyleRow = fetchMessage.components[0]
            editStyleRow.setComponents(
                new MessageButton()
                .setCustomId('role_button')
                .setLabel(fetchMessage.components[0].components[0].label)
                .setStyle(style)
                .setEmoji(fetchMessage.components[0].components[0].emoji)
            )
            await fetchMessage.edit({
                components: [editStyleRow]
            })
        }
        // check if label option has been seleted and edit the button with new label
        if (label) {
            // check label limits
            if (label.length > buttonLimits.label) {
                return interaction.reply({
                    content: `:x: Label must be lower or equal than **${buttonLimits.label}** characters.`,
                    ephemeral: true
                })
            }

            const editStyleRow = fetchMessage.components[0]
            editStyleRow.setComponents(
                new MessageButton()
                .setCustomId('role_button')
                .setLabel(label)
                .setStyle(fetchMessage.components[0].components[0].style)
                .setEmoji(fetchMessage.components[0].components[0].emoji)
            )
            await fetchMessage.edit({
                components: [editStyleRow]
            }).catch(console.error)
        }

        // check if role option has been seleted and set new role in database
        if (role) {
            const buttonData = await client.db.get('buttons', messageId);
            buttonData['roles'] = [role.id];
            await client.db.set('buttons', messageId, buttonData);
        }

        // check if content option has been seleted and edit the message with new content
        if (content) {
            if (content.length > buttonLimits.content) {
                return interaction.reply({
                    content: `:x: Content must be lower or equal than **${buttonLimits.content}** characters.`,
                    ephemeral: true
                })
            }

            await fetchMessage.edit({ content });
        }

       // check if emoji option has been seleted and edit the button with new emoji
       if (emoji) {
           const editEmojiRow = fetchMessage.components[0]
           editEmojiRow.setComponents(
               new MessageButton()
               .setCustomId('role_button')
               .setLabel(fetchMessage.components[0].components[0].label)
               .setStyle(fetchMessage.components[0].components[0].style)
               .setEmoji(emoji)
           )
           await fetchMessage.edit({
               components: [editEmojiRow]
           })
       }

       return interaction.reply({
           content: `✅ Button successfully updated [View Message](${fetchMessage.url})`
       })
    }
}