import { createFileRoute } from "@tanstack/react-router";
import { getRecords, saveRecord } from "@/lib/mongoDbService";
import { GOALS } from "@/lib/uc";

export const Route = createFileRoute("/api/db/categories")({
  server: {
    handlers: {
      GET: async () => {
        let records = await getRecords("categories");

        // Ensure all categories from GOALS are in DB
        const totalGoals = Object.keys(GOALS).length;
        if (!records || records.length < totalGoals) {
          for (const [uid, [name, emoji]] of Object.entries(GOALS)) {
            await saveRecord("categories", { uid }, { uid, name, emoji, goal_uid: uid });
          }
          records = await getRecords("categories");
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: records.length,
            results: records,
          }),
          {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-cache",
            },
          },
        );
      },
    },
  },
});
