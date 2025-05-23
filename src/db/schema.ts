// schema.ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const test = sqliteTable("test_migrations_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});
