import { db } from "@/database/dexie";
import { AppSettings } from "@/types";

export const settingsRepository = {
  async get() {
    return db.settings.get("app-settings");
  },
  async upsert(settings: AppSettings) {
    await db.settings.put(settings);
  },
};
