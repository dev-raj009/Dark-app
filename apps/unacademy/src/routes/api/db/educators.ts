import { createFileRoute } from "@tanstack/react-router";
import { getOrFetchCategoryEducators } from "@/lib/syncWorker";
import { getRecords } from "@/lib/mongoDbService";

export const Route = createFileRoute("/api/db/educators")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const categoryUid =
          url.searchParams.get("categoryUid") ||
          url.searchParams.get("goal_uid") ||
          url.searchParams.get("goalUid") ||
          url.searchParams.get("uid") ||
          undefined;

        let results: Record<string, unknown>[] = [];
        if (categoryUid) {
          results = await getOrFetchCategoryEducators(categoryUid);
        } else {
          results = await getRecords("educators");
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: results.length,
            categoryUid: categoryUid || "all",
            results,
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
