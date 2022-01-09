const Timeout = new Set()
const { MessageEmbed } = require('discord.js');
const humanizeDuration = require("humanize-duration");

module.exports = async(client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
		if (!client.commands.has(interaction.commandName)) return;
		if (!interaction.guild) return;
		const command = client.commands.get(interaction.commandName)
		try {
			if (command.timeout) {
				if (Timeout.has(`${interaction.user.id}${command.name}`)) {
					const embed = new MessageEmbed()
					.setTitle('You are in timeout!')
					.setDescription(`You need to wait **${humanizeDuration(command.timeout, { round: true })}** to use command again`)
					.setColor('#ff0000')
					return interaction.reply({ embeds: [embed], ephemeral: true })
				}
			}
			if (command.permission) {
				if (!interaction.member.permissions.has(command.permission)) {
					const embed = new MessageEmbed()
					.setTitle('Missing Permission')
					.setDescription(`:x: You need \`${command.permission}\` to use this command`)
					.setColor('#ff0000')
					.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
					.setTimestamp()
					return interaction.reply({ embeds: [embed], ephemeral: true })
				}
			}
			if (command.devs) {
				if (!process.env.OWNERS.includes(interaction.user.id)) {
					return interaction.reply({ content: ":x: Only devs can use this command", ephemeral: true });
				}
			}
			if (command.ownerOnly) {
				if (interaction.user.id !== interaction.guild.ownerId) {
					return interaction.reply({ content: "Only ownership of this server can use this command", ephemeral: true })
				}
			}
			command.run(interaction, client);
			Timeout.add(`${interaction.user.id}${command.name}`)
			setTimeout(() => {
				Timeout.delete(`${interaction.user.id}${command.name}`)
			}, command.timeout);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: ':x: There was an error while executing this command!', ephemeral: true });
		}
	}
	try {
		if (interaction.isSelectMenu()) {
			const commandsCustomIDS = [
				"info_cmd",
				"general_cmd"
			]
			if (commandsCustomIDS.includes(interaction.customId)) {
				const selectedValues = interaction.values;
				const findCommand = client.commands.find(r => r.name === selectedValues[0])
				if (selectedValues.includes(findCommand.name)) {
					const embed = new MessageEmbed()
					.setColor(interaction.guild.me.displayHexColor)
					.setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
					if (findCommand.name) {
						embed.setTitle(`Command: ${findCommand.name}`)
					}
					if (findCommand.description) {
						embed.setDescription(findCommand.description)
					}
					if (findCommand.usage) {
						embed.addField("Usage:", findCommand.usage)
					}
					if (findCommand.timeout) {
						embed.addField("Timeout:", humanizeDuration(findCommand.timeout, { round: true }))
					}
					interaction.message.edit({
						content: null,
						components: [],
						embeds: [embed]
					})
				}
			}
		}
	} catch (e) {
		console.error(e)
		return false;
	}
	if (interaction.isButton()) {
		if (interaction.customId === 'role_button') {
			const data = await client.db.get('buttons', interaction.message.id);
			if (!data) {
				return interaction.reply({
					content: `:x: i can\'t find data linked with this message.\nIf you are server admin you can create new button using command, \`/button create\``,
					ephemeral: true
				}).catch(console.error);
			}
			if (data.action === 'toggle') {
				const findRole = interaction.guild.roles.cache.get(data.role);
				if (!findRole) {
					return interaction.reply({ content: `:x: i can\'t find role linked with this message.\nIf you are server admin you can edit message data with command\n**/button edit** and chose \`new_role\` option`, ephemeral: true }).catch(e => {});
				}
				if (interaction.member.roles.cache.has(data.role)) {
					await interaction.member.roles.remove(data.role).catch(e => {});
					return interaction.reply({ content: `Removed, **${findRole.name}** role.`, ephemeral: true }).catch(e => {});
				} else {
					await interaction.member.roles.add(data.role, `By discord buttons.`).catch(e => console.error);
					return interaction.reply({ content: `Added, **${findRole.name}** role.`, ephemeral: true }).catch(e => {});
				}
			}
			if (data.action === 'give') {
				const findRole = interaction.guild.roles.cache.get(data.role);
				if (!findRole) {
					return interaction.reply({ content: `:x: i can\'t find role linked with this message.\nIf you are server admin you can edit message data with command\n**/button edit** and chose \`new_role\` option`, ephemeral: true }).catch(e => {});
				}
				if (interaction.member.roles.cache.has(data.role)) {
					return interaction.reply({
						content: `:x: You already have **${findRole.name}** role.`,
						ephemeral: true
					})
				}
				await interaction.member.roles.add(data.role);
				return interaction.reply({
					content: `Added, **${findRole.name}** role.`,
					ephemeral: true
				})
			}
			if (data.action === 'take') {
				const findRole = interaction.guild.roles.cache.get(data.role);
				if (!findRole) {
					return interaction.reply({ content: `:x: i can\'t find role linked with this message.\nIf you are server admin you can edit message data with command\n**/button edit** and chose \`new_role\` option`, ephemeral: true }).catch(e => {});
				}
				if (!interaction.member.roles.cache.has(data.role)) {
					return interaction.reply({
						content: `:x: You don't have **${findRole.name}** role.`,
						ephemeral: true
					})
				}
				await interaction.member.roles.remove(data.role);
				interaction.reply({
					content: `Removed, **${findRole.name}** role.`,
					ephemeral: true
				})
			}
		}
	}
} 
