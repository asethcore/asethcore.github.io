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
