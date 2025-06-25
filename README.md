# GameDB

A fast, simple API for searching Steam games by name or appid.

**Live demo:** [steam.watercollector.icu](https://steam.watercollector.icu/)  
**GitHub:** [FrantisekSilhan/GameDB](https://github.com/FrantisekSilhan/GameDB)

---

## Features

- 🔍 Search Steam games by name (fuzzy, full-text search)
- 🔢 Search by appid (with nearby appids)
- 🚀 Fast, lightweight, and easy to use
- 🟢 Open API, no authentication required

---

## API Usage

### Root

`GET /`

Returns a simple usage guide.

---

### Search

`GET /search?q=your_query`

- **q**: Game name (full or partial, e.g. `counter strike`) or appid (e.g. `730`)

#### Examples

- [Search for "counter strike"](https://steam.watercollector.icu/search?q=counter%20strike)
- [Search for appid 730](https://steam.watercollector.icu/search?q=730)

#### Response

- **Text search:** Returns up to **10** matching games as JSON.
- **Appid search:** Returns up to **21** games (the appid and up to 10 before/after, if they exist).

```json
[
  {
    "id": 730,
    "name": "Counter-Strike: Global Offensive",
    // ...other fields
  },
  ...
]
```

---

## Self-Hosting

1. **Clone the repo:**

   ```sh
   git clone https://github.com/FrantisekSilhan/GameDB.git
   cd GameDB
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure your database:**

   - Edit `drizzle.config.ts` and `.env` as needed.

4. **Run the server:**

   ```sh
   npm start
   ```

---

## Credits

- Built with [Express](https://expressjs.com/), [Drizzle ORM](https://orm.drizzle.team/), and [PostgreSQL](https://www.postgresql.org/).
- Steam data via [Steam Web API](https://partner.steamgames.com/doc/webapi_overview).

---

## License

AGPL-3.0