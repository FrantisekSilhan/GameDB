# GameDB

A fast, simple API for searching Steam games by name or appid.

**Live demo:** [steam.watercollector.icu](https://steam.watercollector.icu/)  
**GitHub:** [FrantisekSilhan/GameDB](https://github.com/FrantisekSilhan/GameDB)

---

## Features

- 🔍 Search Steam games by name (fuzzy, full-text search)
- 🔢 Search by appid (with nearby appids)
- ✅ Bulk verify appids
- 🚀 Fast, lightweight, and easy to use
- 🟢 Open API, no authentication required

---

## API Endpoints

### 1. Root

**GET /**

Returns a simple usage guide.

---

### 2. Search

**GET /search**

**Query parameters:**

- `q` (string): Game name (full or partial, e.g. `counter strike`) or appid (e.g. `730`)

**Result limits:**

- **Text search:** Up to 10 results
- **Appid search:** Up to 21 results (appid ±10)

**Example requests:**

- [Search for "counter strike"](https://steam.watercollector.icu/search?q=counter%20strike)
- [Search for appid 730](https://steam.watercollector.icu/search?q=730)

**Example response:**

```json
[
  {
    "id": 730,
    "name": "Counter-Strike 2"
  }
]
```

---

### 3. Verify AppIDs

**POST /verify**

**Request body:**  
JSON object with an array of appids (max 100):

```json
{
  "appids": [730, 440, 123456]
}
```

**Response:**

```json
{
  "allValid": false,
  "valid": [730, 440],
  "invalid": [123456]
}
```

- `allValid`: `true` if all IDs are valid, `false` otherwise
- `valid`: array of valid appids
- `invalid`: array of invalid appids

---

### 4. Get Game Names

**POST /names**

**Request body:**  
JSON object with an array of appids (max 100):

```json
{
  "appids": [730, 440, 570]
}
```

**Response:**

```json
{
  "count": 3,
  "games": {
    "730": "Counter-Strike 2",
    "440": "Team Fortress 2",
    "570": "Dota 2"
  }
}
```

- `count`: number of valid matching games  
- `games`: object mapping appid → game name  

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