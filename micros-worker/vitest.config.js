import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.jsonc" },
				miniflare: {
					kvNamespaces: { MICROS_KV: "test-micros-kv" },
					bindings: { MICROS_TOKEN: "test-token" },
				},
			},
		},
	},
});
