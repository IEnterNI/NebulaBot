const fs = require('fs');
const { Client } = require('discord.js');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({ partials: ['MESSAGE'] });

client.on('ready', onReady);
client.on('messageReactionAdd', addRole);
client.on('messageReactionRemove', removeRole);

client.login(process.env.BOT_TOKEN);

async function onReady() {
	const channel = client.channels.cache.find((channel) => channel.name === config.channel);

	// channel will not contain messages after it is found
	try {
		console.log(`Logged in as ${client.user.tag}!`);
		await channel.messages.fetch({ limit: 1 }).then(messages => {
			config.message_id = messages.first().id;
		});
	}
	catch (err) {
		console.error('Error fetching channel messages', err);
		return;
	}
	console.log('Watching first message for reactions...');
}

async function addRole({ message, _emoji }, user) {
	if (user.bot || message.id !== config.message_id) {
		return;
	}
	if (message.partial) {
		try {
			await message.fetch();
		}
		catch (err) {
			console.error('Error fetching message', err);
			return;
		}
	}

	const { guild } = message;
	const member = guild.members.cache.get(user.id);
	const role = guild.roles.cache.find((role) => role.name === config.roles[_emoji.name]);
	// console.log(role);
	// console.log (_emoji.name);
	if (!role) {
		console.error(`Role not found for ${_emoji.name}`);
		return;
	}
	try {
		member.roles.add(role.id);
	}
	catch (err) {
		console.error('Error adding role', err);
		return;
	}
}

async function removeRole({ message, _emoji }, user) {
	if (user.bot || message.id !== config.message_id) {
		return;
	}
	if (message.partial) {
		try {
			await message.fetch();
		}
		catch (err) {
			console.error('Error fetching message', err);
			return;
		}
	}

	const { guild } = message;
	const member = guild.members.cache.get(user.id);
	const role = guild.roles.cache.find((role) => role.name === config.roles[_emoji.name]);

	if (!role) {
		console.error(`Role not found for ${_emoji.name}`);
		return;
	}
	try{
		member.roles.remove(role.id);
	}
	catch (err) {
		console.error('Error removing role', err);
		return;
	}
}
