import { defineApp } from "@redwoodjs/sdk/worker";
import { index, render } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "src/pages/Home";
import { setCommonHeaders } from "src/headers";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  db: ReturnType<typeof drizzle>;
};

export default defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup db in appContext
    ctx.db = drizzle(env.DB);
  },
  render(Document, [index([Home])]),
]);
