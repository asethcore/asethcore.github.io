import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const WORKER_URL = process.env.WORKER_URL;
const WORKER_TOKEN = process.env.WORKER_TOKEN;

if (!TOKEN || !CHANNEL_ID || !WORKER_URL || !WORKER_TOKEN) {
	console.error("missing env vars — check .env (DISCORD_TOKEN, CHANNEL_ID, WORKER_URL, WORKER_TOKEN)");
	process.exit(1);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once("clientReady", () => {
	console.log(`ready as ${client.user.tag} in guilds: ${client.guilds.cache.map((g) => g.name).join(", ") || "none"}`);
});

client.on("messageCreate", async (message) => {
	console.log(`message from ${message.author.tag} in channel ${message.channelId} (target ${CHANNEL_ID})`);
	if (message.author.bot) return;
	if (message.channelId !== CHANNEL_ID) return;

	try {
		const res = await fetch(`${WORKER_URL}/submit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${WORKER_TOKEN}`,
			},
			body: JSON.stringify({
				text: message.cleanContent,
				time: new Date().toISOString(),
			}),
		});

		if (res.ok) {
			await message.react("✅");
		} else {
			console.error("worker error:", res.status, await res.text());
		}
	} catch (err) {
		console.error(err);
	}
});

client.login(TOKEN);
