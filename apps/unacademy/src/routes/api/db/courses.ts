import { createFileRoute } from "@tanstack/react-router";
import {
  getOrFetchEducatorCourses,
  getOrFetchCategoryCourses,
  getOrFetchCourseLectures,
  extractCleanId,
} from "@/lib/syncWorker";
import { getRecords } from "@/lib/mongoDbService";

export const Route = createFileRoute("/api/db/courses")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const username =
          url.searchParams.get("username") ||
          url.searchParams.get("educator") ||
          url.searchParams.get("teacher") ||
          url.searchParams.get("author") ||
          undefined;

        const categoryUid =
          url.searchParams.get("categoryUid") ||
          url.searchParams.get("goal_uid") ||
          url.searchParams.get("goalUid") ||
          undefined;

        const rawCourseUid =
          url.searchParams.get("courseUid") ||
          url.searchParams.get("uid") ||
          url.searchParams.get("id") ||
          url.searchParams.get("course_uid") ||
          undefined;

        const search = url.searchParams.get("search") || url.searchParams.get("q") || undefined;

        let results: Record<string, unknown>[] = [];

        if (rawCourseUid) {
          const cleanUid = extractCleanId(rawCourseUid);
          let found = await getRecords("courses", { uid: cleanUid });
          if (!found || found.length === 0) {
            // Auto-fetch lectures to hydrate course record
            await getOrFetchCourseLectures(cleanUid);
            found = await getRecords("courses", { uid: cleanUid });
          }
          results = found;
        } else if (username) {
          results = await getOrFetchEducatorCourses(username, categoryUid);
        } else if (categoryUid) {
          results = await getOrFetchCategoryCourses(categoryUid);
        } else if (search) {
          results = await getRecords("courses", { search });
        } else {
          results = await getRecords("courses");
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: results.length,
            username: username || undefined,
            categoryUid: categoryUid || undefined,
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
