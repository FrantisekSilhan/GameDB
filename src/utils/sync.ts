import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

const BATCH_SIZE = 1000;
const SYNC_KEY = "steam_games";
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const getLastSyncTime = async () => {
  const result = await db
    .select()
    .from(schema.syncMeta)
    .where(eq(schema.syncMeta.key, SYNC_KEY))
    .limit(1);

  if (result.length === 0) return 0;
  return result[0].updatedAt.getTime();
};

const setLastSyncTime = async (date: Date) => {
  await db.transaction(async (tx) => {
    await tx.insert(schema.syncMeta).values({
      key: SYNC_KEY,
      value: date.toISOString(),
      updatedAt: date,
    }).onConflictDoUpdate({
      target: schema.syncMeta.key,
      set: {
        value: date.toISOString(),
        updatedAt: date,
      },
    });
  });
};

export const syncSteamGames = async () => {
  const lastSync = await getLastSyncTime();
  const now = new Date;

  if (!lastSync) {
    await setLastSyncTime(new Date(1));
    return false;
  }

  if ((now.getTime() - lastSync) < SYNC_INTERVAL) return false;

  const response = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json");
  if (!response.ok) {
    return false;
  }
  const data = await response.json();

  const apps: { appid: number; name: string }[] = data.applist.apps;

  const rows = apps.map((app) => ({
    id: app.appid,
    name: app.name,
  }));

  await db.transaction(async (tx) => {
    await tx.delete(schema.game);
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await tx.insert(schema.game).values(batch);
    }
  });
  
  await setLastSyncTime(now);
  console.log(`Synced ${rows.length} games from Steam.`);
  return true;
};