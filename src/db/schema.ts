import { sql, type SQL } from "drizzle-orm";
import { bigint, pgTable, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";

export const lower = (column: AnyPgColumn): SQL => {
  return sql`LOWER(${column})`;
};

export const game = pgTable("games", {
  id: bigint("id", { mode: "number" })
    .primaryKey(),
  name: text("name")
    .notNull(),
});

export const syncMeta = pgTable("sync_meta", {
  key: text("key")
    .primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});