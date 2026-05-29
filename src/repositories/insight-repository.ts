import { db } from "@/database/dexie";
import type { Insight } from "@/types";

export const insightRepository = {
  async list() {
    return db.insights.orderBy("createdAt").reverse().toArray();
  },
  async replaceMonth(month: string, insights: Insight[]) {
    await db.transaction("rw", db.insights, async () => {
      await db.insights.where("month").equals(month).delete();
      if (insights.length > 0) {
        await db.insights.bulkPut(insights);
      }
    });
  },
};
