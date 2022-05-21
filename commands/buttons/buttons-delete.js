module.exports = {
    name: "delete",
    run: async(interaction, client) => {
        const messageId = interaction.options.getString('message_id');

        const getMessageData = await client.db.get('buttons', messageId);
        if (!getMessageData) {
            return interaction.reply({
                content: `:x: I can\'t find message data`,
                ephemeral: true
            })
        }

        const message = await interaction.guild.channels.cache.get(getMessageData.channel).messages.fetch(getMessageData.message);
        await client.db.delete('buttons', messageId);
        await message.delete();
        interaction.reply({
            content: '✅ Message has been deleted successfully.'
        })
    }
}