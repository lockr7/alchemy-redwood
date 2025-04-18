import "alchemy/cloudflare";

import alchemy from "alchemy";
import { ViteSite } from "./vite-site";

const app = await alchemy("redwood-app", {
  phase: process.argv.includes("--destroy") ? "destroy" : "up",
});

export const website = await ViteSite("redwood-app", {
  command: "bun run build",
  main: "dist/worker/worker.js",
  assets: "dist/client",
});

console.log({
  url: website.url,
});

await app.finalize();
