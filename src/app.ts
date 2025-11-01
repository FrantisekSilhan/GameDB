import express from "express";
import { db, schema } from "./db";
import "./setup";
import { between, inArray, sql } from "drizzle-orm";
import { syncSteamGames } from "./utils/sync";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay =
    currentYear === startYear ? `${startYear}` : `${startYear}-${currentYear}`;

  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" >
      <title>GameDB API – Search Steam Games by Name or AppID</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" >
      <meta name="description" content="GameDB is a fast, simple API for searching Steam games by name or appid. Try it live or check out the source code on GitHub." >
      <meta property="og:title" content="GameDB API – Search Steam Games" >
      <meta property="og:description" content="A fast, simple API for searching Steam games by name or appid. Free and open source." >
      <meta property="og:url" content="https://steam.watercollector.icu/" >
      <meta property="og:type" content="website" >
      <meta property="og:image" content="https://steam.watercollector.icu/android-chrome-512x512.png" >
      <link rel="canonical" href="https://steam.watercollector.icu/" >

      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/svg+xml" href="/logo.svg">
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="manifest" href="/site.webmanifest">
      <link rel="shortcut icon" href="/favicon.ico">
      <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
      <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
      <meta name="theme-color" content="#1B2836">

      <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
        a { color: #0078d7; text-decoration: none; }
        a:hover { text-decoration: underline; }
        header, main, nav, footer { display: block; }
        footer { margin-top: 2rem; font-size: 0.875rem; color: #666; text-align: center; }
        ul { padding-left: 1.2em; }
        li { margin-bottom: 0.5em; }
        pre { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto; }
      </style>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebAPI",
          "name": "GameDB API",
          "description": "A fast, simple API for searching Steam games by name or appid.",
          "documentation": "https://github.com/FrantisekSilhan/GameDB",
          "url": "https://steam.watercollector.icu/",
          "provider": {
            "@type": "Person",
            "name": "František Šilhán",
            "url": "https://github.com/FrantisekSilhan"
          }
        }
      </script>
    </head>
    <body>
      <header>
        <h1>GameDB API</h1>
        <p>
          <strong>Live:</strong>
          <a href="https://steam.watercollector.icu/" target="_blank" rel="noopener">steam.watercollector.icu</a><br>
          <strong>GitHub:</strong>
          <a href="https://github.com/FrantisekSilhan/GameDB" target="_blank" rel="noopener">FrantisekSilhan/GameDB</a>
        </p>
      </header>
      <main>
        <section>
          <h2>What is GameDB?</h2>
          <p>
            GameDB is a fast, simple API for searching Steam games by name or appid.
            It’s free, open source, and easy to use.
          </p>
        </section>
        <nav>
          <h2>API Endpoints</h2>
          <ul>
            <li>
              <strong>GET <code>/search</code></strong><br>
              <em>Query parameters:</em> <code>q</code> (game name or appid)<br>
              <em>Returns:</em> List of matching games (JSON)<br>
              <em>Limits:</em>
              <ul>
                <li>Text search: up to 10 results</li>
                <li>Appid search: up to 21 results (appid ±10)</li>
              </ul>
            </li>
            <li>
              <strong>POST <code>/verify</code></strong><br>
              <em>Body:</em> JSON <code>{"appids": [730, 440, ...]}</code> (max 100 appids)<br>
              <em>Returns:</em> Validity of each appid (JSON)
            </li>
            <li>
              <strong>POST <code>/names</code></strong><br>
              <em>Body:</em> JSON <code>{"appids": [730, 440, ...]}</code> (max 100 appids)<br>
              <em>Returns:</em> Names of matching games (JSON)
            </li>
          </ul>
        </nav>
        <section>
          <h2>Examples</h2>
          <ul>
            <li>
              <a href="/search?q=counter%20strike" rel="nofollow">
                <code>GET /search?q=counter%20strike</code>
              </a>
              – Search for <code>counter strike</code>
            </li>
            <li>
              <a href="/search?q=730" rel="nofollow">
                <code>GET /search?q=730</code>
              </a>
              – Search for <code>730</code>
            </li>
          </ul>
          <p><strong>POST <code>/verify</code> example:</strong></p>
          <pre><code>{
  "appids": [730, 440, 123456]
}</code></pre>
            <em>Response:</em>
          <pre><code>{
  "allValid": false,
  "valid": [730, 440],
  "invalid": [123456]
}</code></pre>

          <p><strong>POST <code>/names</code> example:</strong></p>
          <pre><code>{
  "appids": [730, 440, 570]
}</code></pre>
          <em>Response:</em>
          <pre><code>{
  "count": 3,
  "games": {
    "730": "Counter-Strike 2",
    "440": "Team Fortress 2",
    "570": "Dota 2"
  }
}</code></pre>
        </section>
      </main>
      <footer>
        <p>
          &copy; ${yearDisplay} <a href="https://github.com/FrantisekSilhan" target="_blank" rel="noopener">František Šilhán</a> &mdash; AGPL-3.0 License
        </p>
      </footer>
    </body>
    </html>
  `);
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

app.post("/verify", async (req, res) => {
  const appids: number[] = req.body.appids;
  const MAX_APPIDS = 100;

  if (!Array.isArray(appids) || appids.length === 0) {
    res.status(400).json({ error: "Request body must contain an array of appids" });
    return;
  }

  if (appids.length > MAX_APPIDS) {
    res.status(400).json({ error: `Maximum ${MAX_APPIDS} appids allowed per request` });
    return;
  }

  const rows = await db
    .select()
    .from(schema.game)
    .where(inArray(schema.game.id, appids));

  const valid = rows.map(row => row.id);
  const invalid = appids.filter(id => !valid.includes(id));
  const allValid = invalid.length === 0;

  res.json({
    allValid: allValid,
    valid: valid,
    invalid: invalid,
  });
});

app.post("/names", async (req, res) => {
  const appids: number[] = req.body.appids;
  const MAX_APPIDS = 100;

  if (!Array.isArray(appids) || appids.length === 0) {
    res.status(400).json({ error: "Request body must contain an array of appids" });
    return;
  }

  if (appids.length > MAX_APPIDS) {
    res.status(400).json({ error: `Maximum ${MAX_APPIDS} appids allowed per request` });
    return;
  }

  const rows = await db
    .select({
      id: schema.game.id,
      name: schema.game.name,
    })
    .from(schema.game)
    .where(inArray(schema.game.id, appids));

  const result: Record<number, string> = {};
  for (const row of rows) {
    result[row.id] = row.name;
  }

  res.json({
    count: rows.length,
    games: result,
  });
});

app.use(express.static("public"));

app.use((_, res) => {
  res.status(404).type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>404 – Not Found | GameDB API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; color: #333; }
        h1 { color: #c00; }
        a { color: #0078d7; }
      </style>
    </head>
    <body>
      <h1>404 – Not Found</h1>
      <p>The page you requested does not exist.</p>
      <p><a href="/">Go back to the homepage</a></p>
    </body>
    </html>
  `);
});

app.use((err: any, _: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>500 – Server Error | GameDB API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; color: #333; }
        h1 { color: #c00; }
        a { color: #0078d7; }
      </style>
    </head>
    <body>
      <h1>500 – Server Error</h1>
      <p>Sorry, something went wrong on our end.</p>
      <p><a href="/">Go back to the homepage</a></p>
    </body>
    </html>
  `);
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