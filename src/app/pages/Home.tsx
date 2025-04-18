import { users } from "../../db/schema";
import { RequestInfo } from "@redwoodjs/sdk/worker";

export async function Home({ ctx }: RequestInfo) {
  const allUsers = await ctx.db.select().from(users).all();
  return (
    <div>
      <h1>Hello World, using Alchemy</h1>
      <pre>{JSON.stringify(allUsers, null, 2)}</pre>
    </div>
  );
}
