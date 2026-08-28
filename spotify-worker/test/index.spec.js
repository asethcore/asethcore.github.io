import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../src";

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function spotifyFetchMock({ playing = true } = {}) {
	return vi.fn((url) => {
		if (url === "https://accounts.spotify.com/api/token") {
			return Promise.resolve(jsonResponse({ access_token: "token123" }));
		}
		if (url === "https://api.spotify.com/v1/me/player/currently-playing") {
			if (!playing) return Promise.resolve(new Response(null, { status: 204 }));
			return Promise.resolve(
				jsonResponse({
					is_playing: true,
					progress_ms: 65000,
					item: {
						name: "sample song",
						artists: [{ name: "artist one" }, { name: "artist two" }],
						album: { images: [{ url: "https://cover.example/art" }] },
						duration_ms: 180000,
						external_urls: { spotify: "https://open.spotify.com/track/abc" },
					},
				})
			);
		}
		if (url === "https://api.spotify.com/v1/me/player/queue") {
			if (!playing) return Promise.resolve(new Response(null, { status: 204 }));
			return Promise.resolve(
				jsonResponse({
					queue: [
						{
							name: "next song",
							artists: [{ name: "next artist" }],
							album: { images: [{ url: "https://cover.example/next" }] },
							external_urls: { spotify: "https://open.spotify.com/track/def" },
						},
					],
				})
			);
		}
		if (url.startsWith("https://api.spotify.com/v1/me/player/recently-played")) {
			if (!playing) return Promise.resolve(jsonResponse({ items: [] }));
			return Promise.resolve(
				jsonResponse({
					items: [
						{
							played_at: "2026-08-28T10:00:00.000Z",
							track: {
								name: "old song",
								artists: [{ name: "old artist" }],
								album: { images: [{ url: "https://cover.example/old" }] },
								external_urls: { spotify: "https://open.spotify.com/track/ghi" },
							},
						},
					],
				})
			);
		}
		return Promise.reject(new Error("unexpected url: " + url));
	});
}

async function callWorker() {
	const ctx = createExecutionContext();
	const response = await worker.fetch(new Request("http://example.com"), env, ctx);
	await waitOnExecutionContext(ctx);
	return response;
}

describe("spotify worker", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns playing song with progress, queue and recently played", async () => {
		vi.stubGlobal("fetch", spotifyFetchMock());

		const response = await callWorker();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.playing).toBe(true);
		expect(data.title).toBe("sample song");
		expect(data.artist).toBe("artist one, artist two");
		expect(data.cover).toBe("https://cover.example/art");
		expect(data.spotify_url).toBe("https://open.spotify.com/track/abc");
		expect(data.progress_ms).toBe(65000);
		expect(data.duration_ms).toBe(180000);

		expect(data.queue).toHaveLength(1);
		expect(data.queue[0].title).toBe("next song");
		expect(data.queue[0].artist).toBe("next artist");

		expect(data.recently_played).toHaveLength(1);
		expect(data.recently_played[0].title).toBe("old song");
		expect(data.recently_played[0].played_at).toBe("2026-08-28T10:00:00.000Z");
	});

	it("returns fallback values when nothing is playing", async () => {
		vi.stubGlobal("fetch", spotifyFetchMock({ playing: false }));

		const response = await callWorker();
		const data = await response.json();

		expect(data.playing).toBe(false);
		expect(data.title).toBe("listening");
		expect(data.artist).toBe("to the world around him");
		expect(data.cover).toBe("");
		expect(data.progress_ms).toBe(0);
		expect(data.duration_ms).toBe(0);
		expect(data.queue).toEqual([]);
		expect(data.recently_played).toEqual([]);
	});

	it("returns 500 with token error when auth fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() =>
				Promise.resolve(
					jsonResponse({ error: "invalid_grant" }, 400)
				)
			)
		);

		const response = await callWorker();
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data.error).toBe("invalid_grant");
	});
});
