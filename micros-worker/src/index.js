const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
	"Access-Control-Max-Age": "86400",
};

const KEY = "micros";
const MAX_MICROS = 30;
const MAX_TEXT = 500;

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json", ...CORS },
	});
}

async function readMicros(kv) {
	return (await kv.get(KEY, "json").catch(() => null)) || [];
}

function hexToBytes(hex) {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

async function verifyInteraction(request, rawBody, publicKey) {
	const signature = request.headers.get("X-Signature-Ed25519");
	const timestamp = request.headers.get("X-Signature-Timestamp");
	if (!signature || !timestamp || !publicKey) return false;
	try {
		const key = await crypto.subtle.importKey(
			"raw",
			hexToBytes(publicKey),
			{ name: "Ed25519" },
			false,
			["verify"]
		);
		return await crypto.subtle.verify(
			"Ed25519",
			key,
			hexToBytes(signature),
			new TextEncoder().encode(timestamp + rawBody)
		);
	} catch (err) {
		console.error("verify failed:", err);
		return false;
	}
}

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS });
		}

		const url = new URL(request.url);

		if (request.method === "GET" && url.pathname === "/") {
			const micros = await readMicros(env.MICROS_KV);
			return json(micros);
		}

		if (request.method === "POST" && url.pathname === "/discord") {
			const rawBody = await request.text();
			let body;
			try {
				body = JSON.parse(rawBody);
			} catch {
				return json({ error: "invalid json" }, 400);
			}

			if (!(await verifyInteraction(request, rawBody, env.DISCORD_PUBLIC_KEY))) {
				return json({ error: "invalid signature" }, 401);
			}

			if (body.type === 1) {
				return json({ type: 1 });
			}

			if (body.type === 2) {
				if (body.data?.name !== "micros") {
					return json({ type: 4, data: { content: "unknown command", flags: 64 } });
				}
				if (env.CHANNEL_ID && body.channel_id !== env.CHANNEL_ID) {
					return json({ type: 4, data: { content: "wrong channel", flags: 64 } });
				}
				const option = (body.data.options || []).find((o) => o.name === "text");
				const text = String(option?.value || "").trim();
				if (!text) {
					return json({ type: 4, data: { content: "empty micro", flags: 64 } });
				}

				const reply = { type: 4, data: { content: `✅ ${text.slice(0, 200)}`, flags: 64 } };

				const lastToken = await env.MICROS_KV.get("last_interaction").catch(() => null);
				if (body.token && body.token === lastToken) {
					return json(reply);
				}

				const micros = await readMicros(env.MICROS_KV);
				const newest = micros[0];
				if (
					newest &&
					newest.text === text &&
					Date.now() - new Date(newest.time).getTime() < 10000
				) {
					return json(reply);
				}

				micros.unshift({ text: text.slice(0, MAX_TEXT), time: new Date().toISOString() });
				await env.MICROS_KV.put(KEY, JSON.stringify(micros.slice(0, MAX_MICROS)));
				if (body.token) {
					await env.MICROS_KV.put("last_interaction", body.token);
				}

				return json(reply);
			}

			return json({ type: 4, data: { content: "unsupported interaction", flags: 64 } });
		}

		if (request.method === "POST" && url.pathname === "/submit") {
			const auth = request.headers.get("Authorization") || "";
			if (auth !== `Bearer ${env.MICROS_TOKEN}`) {
				return json({ error: "unauthorized" }, 401);
			}

			let body;
			try {
				body = await request.json();
			} catch {
				return json({ error: "invalid json" }, 400);
			}

			const text = String(body.text || "").trim();
			if (!text) {
				return json({ error: "text is required" }, 400);
			}

			const time = body.time || new Date().toISOString();

			const micros = await readMicros(env.MICROS_KV);
			micros.unshift({ text: text.slice(0, MAX_TEXT), time });
			const trimmed = micros.slice(0, MAX_MICROS);

			await env.MICROS_KV.put(KEY, JSON.stringify(trimmed));

			return json(trimmed, 201);
		}

		return json({ error: "not found" }, 404);
	},
};
