import express from "express";
import { db, schema } from "./db";
import "./setup";
import { between, sql } from "drizzle-orm";
import { syncSteamGames } from "./utils/sync";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.type("text").send(
    [
      "Welcome to the GameDB API!",
      "",
      "Available endpoints:",
      "  GET  /search?q=your_query   - Search for games by name or appid",
      "",
      "Examples:",
      "  /search?q=counter strike",
      "  /search?q=730",
      "",
      "Have fun! 🚀"
    ].join("\n")
  );
});

app.get("/search", async (req, res) => {
  const q = req.query.q as string | undefined;
  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  if (/^\d+$/.test(q)) {
    const appid = parseInt(q, 10);

    const results = await db
      .select()
      .from(schema.game)
      .where(between(
        schema.game.id,
        appid - 10,
        appid + 10
      ))
      .orderBy(schema.game.id);

    results.sort((a, b) => {
      if (a.id === appid) return -1;
      if (b.id === appid) return 1;
      return 0;
    });

    res.json(results);
    return;
  }

  const results = (await db.execute<{ id: number; name: string }>(sql`
    SELECT *
    FROM games
    WHERE to_tsvector('english', name) @@ plainto_tsquery('english', ${q})
    LIMIT 10
  `,)).rows;

  res.json(results);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  {
    syncSteamGames().catch(console.error);
    setInterval(() => {
      syncSteamGames().catch(console.error);
    }, 60 * 60 * 1000)
  }
});