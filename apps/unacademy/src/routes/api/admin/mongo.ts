import { createFileRoute } from "@tanstack/react-router";
import {
  getStats,
  clearAllData,
  saveRecord,
  getCategoryBreakdown,
  verifyIdInDb,
} from "@/lib/mongoDbService";
import {
  syncSingleGoal,
  startBackgroundSync,
  pauseBackgroundSync,
  globalSyncState,
} from "@/lib/syncWorker";
import { GOALS } from "@/lib/uc";

const SAFE_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-cache",
};

export const Route = createFileRoute("/api/admin/mongo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action");

        if (action === "breakdown") {
          const breakdown = getCategoryBreakdown();
          return new Response(JSON.stringify({ success: true, breakdown }), {
            headers: SAFE_HEADERS,
          });
        }

        if (action === "verify") {
          const id = url.searchParams.get("id") || "";
          const result = await verifyIdInDb(id);
          return new Response(JSON.stringify(result), { headers: SAFE_HEADERS });
        }

        if (action === "status" || action === "sync_status") {
          return new Response(
            JSON.stringify({
              success: true,
              syncState: globalSyncState,
            }),
            { headers: SAFE_HEADERS },
          );
        }

        const stats = await getStats();
        const breakdown = getCategoryBreakdown();
        return new Response(
          JSON.stringify({
            success: true,
            stats,
            breakdown,
            syncState: globalSyncState,
          }),
          {
            headers: SAFE_HEADERS,
          },
        );
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const action = body.action || "start_sync";

          if (action === "start_sync" || action === "resume_sync") {
            const forceRestart = Boolean(body.forceRestart);
            const result = startBackgroundSync(forceRestart);
            const stats = await getStats();
            const breakdown = getCategoryBreakdown();
            return new Response(
              JSON.stringify({
                success: true,
                message: result.message,
                syncState: globalSyncState,
                stats,
                breakdown,
              }),
              { headers: SAFE_HEADERS },
            );
          }

          if (action === "pause_sync" || action === "stop_sync") {
            const result = pauseBackgroundSync();
            const stats = await getStats();
            const breakdown = getCategoryBreakdown();
            return new Response(
              JSON.stringify({
                success: true,
                message: result.message,
                syncState: globalSyncState,
                stats,
                breakdown,
              }),
              { headers: SAFE_HEADERS },
            );
          }

          if (action === "clear") {
            pauseBackgroundSync();
            await clearAllData();
            globalSyncState.currentIndex = 0;
            globalSyncState.progressPercent = 0;
            globalSyncState.currentStepDescription = "Database reset. Ready to sync.";
            globalSyncState.totalTeachersSaved = 0;
            globalSyncState.totalCoursesSaved = 0;
            globalSyncState.totalLecturesSaved = 0;
            globalSyncState.totalVideosSaved = 0;
            globalSyncState.totalPdfsSaved = 0;
            globalSyncState.syncedCategoryUids = [];

            const stats = await getStats();
            const breakdown = getCategoryBreakdown();
            return new Response(
              JSON.stringify({
                success: true,
                message: "MongoDB cleared A to Z successfully.",
                stats,
                breakdown,
                syncState: globalSyncState,
              }),
              { headers: SAFE_HEADERS },
            );
          }

          if (action === "breakdown") {
            const breakdown = getCategoryBreakdown();
            return new Response(JSON.stringify({ success: true, breakdown }), {
              headers: SAFE_HEADERS,
            });
          }

          if (action === "verify") {
            const id = String(body.id || body.query || "");
            const result = await verifyIdInDb(id);
            return new Response(JSON.stringify(result), { headers: SAFE_HEADERS });
          }

          if (action === "sync_goal" && body.goalUid) {
            const goalUid = String(body.goalUid).toUpperCase();
            const maxTeachers = typeof body.maxTeachers === "number" ? body.maxTeachers : 20;
            const maxCourses = typeof body.maxCourses === "number" ? body.maxCourses : 15;

            const res = await syncSingleGoal(goalUid, maxTeachers, maxCourses);
            const stats = await getStats();
            const breakdown = getCategoryBreakdown();

            return new Response(
              JSON.stringify({
                success: true,
                message: `Category ${res.goalName} (${goalUid}) synced 100%! Saved ${res.teachers} Teachers, ${res.courses} Courses, and ${res.lectures} Lectures/Videos.`,
                synced: {
                  goalUid: res.goalUid,
                  goalName: res.goalName,
                  teachers: res.teachers,
                  courses: res.courses,
                  lectures: res.lectures,
                  videos: res.videos,
                  pdfs: res.pdfs,
                },
                stats,
                breakdown,
                syncState: globalSyncState,
              }),
              { headers: SAFE_HEADERS },
            );
          }

          return new Response(JSON.stringify({ error: "Invalid action" }), {
            status: 400,
            headers: SAFE_HEADERS,
          });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Internal error";
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: SAFE_HEADERS,
          });
        }
      },
    },
  },
});
