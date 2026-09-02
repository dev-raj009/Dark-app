import { createFileRoute } from "@tanstack/react-router";
import { verifyIdInDb } from "@/lib/mongoDbService";
import { extractCleanId } from "@/lib/syncWorker";

export const Route = createFileRoute("/api/db/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawId =
          url.searchParams.get("id") ||
          url.searchParams.get("uid") ||
          url.searchParams.get("username") ||
          url.searchParams.get("q") ||
          "";

        const cleanId = extractCleanId(rawId);
        const result = await verifyIdInDb(cleanId || rawId);

        return new Response(JSON.stringify(result), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        });
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          id?: string;
          uid?: string;
          query?: string;
        };
        const rawId = body.id || body.uid || body.query || "";
        const cleanId = extractCleanId(rawId);
        const result = await verifyIdInDb(cleanId || rawId);

        return new Response(JSON.stringify(result), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        });
      },
    },
  },
});
