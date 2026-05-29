import { db } from "@/database/dexie";
import type { Category } from "@/types";

export const categoryRepository = {
  async list() {
    return db.categories.toArray();
  },
  async upsert(category: Category) {
    await db.categories.put(category);
  },
};
