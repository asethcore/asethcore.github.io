import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import worker from "../src";

function request(url, init) {
	return new Request(url, init);
}

describe("micros worker", () => {
	beforeEach(async () => {
		await env.MICROS_KV.delete("micros");
	});

	it("returns an empty list on GET", async () => {
		const response = await worker.fetch(request("https://example.com/"), env, createExecutionContext());
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	it("rejects POST without a token", async () => {
		const response = await worker.fetch(
			request("https://example.com/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: "hi" }),
			}),
			env,
			createExecutionContext()
		);
		expect(response.status).toBe(401);
	});

	it("stores a micro and returns it newest-first", async () => {
		const headers = { "Content-Type": "application/json", Authorization: `Bearer ${env.MICROS_TOKEN}` };

		await worker.fetch(
			request("https://example.com/submit", { method: "POST", headers, body: JSON.stringify({ text: "first", time: "2026-08-26T10:00:00Z" }) }),
			env,
			createExecutionContext()
		);
		await worker.fetch(
			request("https://example.com/submit", { method: "POST", headers, body: JSON.stringify({ text: "second", time: "2026-08-26T11:00:00Z" }) }),
			env,
			createExecutionContext()
		);

		const response = await worker.fetch(request("https://example.com/"), env, createExecutionContext());
		const micros = await response.json();
		expect(micros).toHaveLength(2);
		expect(micros[0].text).toBe("second");
		expect(micros[1].text).toBe("first");
	});
});
