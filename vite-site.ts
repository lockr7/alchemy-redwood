import alchemy from "alchemy";

import { Assets, Bindings, Worker, WranglerJson } from "alchemy/cloudflare";
import { Exec } from "alchemy/os";
import fs from "node:fs/promises";
import path from "node:path";

export interface ViteSiteProps<B extends Bindings> {
  /**
   * The command to run to build the site
   */
  command: string;
  /**
   * The name of the worker
   *
   * @default id
   */
  name?: string;
  /**
   * The entrypoint to your server
   *
   * @default - a simple server that serves static assets is generated
   */
  main?: string;
  /**
   * The directory containing your static assets
   */
  assets: string;
  /**
   * The bindings to pass to the worker
   */
  bindings?: B;
  /**
   * @default process.cwd()
   */
  cwd?: string;
}

export type ViteSite<B extends Bindings> = Promise<
  // don't allow the ASSETS to be overriden
  B extends { ASSETS: any } ? never : Worker<B & { ASSETS: Assets }>
>;

export async function ViteSite<B extends Bindings>(
  id: string,
  props: ViteSiteProps<B>,
): ViteSite<B> {
  if (props.bindings?.ASSETS) {
    throw new Error("ASSETS binding is reserved for internal use");
  }

  // @ts-ignore - we know the types are correct
  return await alchemy.run(id, async () => {
    // Create minimal wrangler.jsonc if it doesn't exist
    // `building the site requires a wrangler.jsonc file to start - so initialize an empty one if it doesn't exist`
    const cwd = props.cwd || process.cwd();
    const wranglerPath = path.join(cwd, "wrangler.jsonc");
    try {
      await fs.access(wranglerPath);
    } catch {
      await fs.writeFile(
        wranglerPath,
        JSON.stringify(
          {
            name: id,
            main: props.main,
            compatibility_date: new Date().toISOString().split("T")[0],
          },
          null,
          2,
        ),
      );
    }

    await Exec("build", {
      command: props.command,
    });

    const staticAssets = await Assets("assets", {
      path: "./dist/client",
    });

    const worker = await Worker("worker", {
      name: props.name ?? id,
      entrypoint: props.main,
      script: props.main
        ? undefined
        : `
export default {
async fetch(request, env) {
  return env.ASSETS.fetch(request);
},
};`,
      url: true,
      adopt: true,
      bindings: {
        ...props.bindings,
        ASSETS: staticAssets,
      },
      bundle: {
        options: {
          external: ["node:events", "node:stream"],
        },
      },
      compatibilityDate: "2025-04-02",
      compatibilityFlags: ["nodejs_compat"],
    });

    await WranglerJson("wrangler.json", {
      worker,
    });

    return worker;
  });
}
