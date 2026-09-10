import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/** True when a database is configured. Otherwise the app runs on in-memory fixtures. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export type Db = ReturnType<typeof db>;
export { schema };
