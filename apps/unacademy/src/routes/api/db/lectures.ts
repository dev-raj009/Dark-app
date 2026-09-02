import { createFileRoute } from "@tanstack/react-router";
import { getOrFetchCourseLectures, extractCleanId } from "@/lib/syncWorker";
import { getRecords } from "@/lib/mongoDbService";

export const Route = createFileRoute("/api/db/lectures")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawCourseUid =
          url.searchParams.get("courseUid") ||
          url.searchParams.get("uid") ||
          url.searchParams.get("id") ||
          url.searchParams.get("course_uid") ||
          url.searchParams.get("course") ||
          undefined;

        const categoryUid =
          url.searchParams.get("categoryUid") || url.searchParams.get("goal_uid") || undefined;

        const search = url.searchParams.get("search") || url.searchParams.get("q") || undefined;

        let results: Record<string, unknown>[] = [];
        if (rawCourseUid) {
          const cleanUid = extractCleanId(rawCourseUid);
          results = await getOrFetchCourseLectures(cleanUid, categoryUid);
        } else if (search) {
          results = await getRecords("lectures", { search });
        } else {
          results = await getRecords("lectures");
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: results.length,
            courseUid: rawCourseUid ? extractCleanId(rawCourseUid) : undefined,
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
