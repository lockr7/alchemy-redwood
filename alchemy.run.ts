import "alchemy/cloudflare";

import alchemy from "alchemy";
import { ViteSite } from "./vite-site";
import { D1Database } from "alchemy/cloudflare";

const app = await alchemy("redwood-app", {
  phase: process.argv.includes("--destroy") ? "destroy" : "up",
});

const database = await D1Database("alchemy-redwood-db", {
  name: "alchemy-redwood-db",
});

export const website = await ViteSite("redwood-app", {
  command:
    "bun run clean && bun run migrate:new && RWSDK_DEPLOY=1 bun run build",
  main: "dist/worker/worker.js",
  assets: "dist/client",
  bindings: {
    DB: database,
  },
});

console.log({
  url: website.url,
});

await app.finalize();
