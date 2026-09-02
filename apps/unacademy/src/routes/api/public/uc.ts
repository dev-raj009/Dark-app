import { createFileRoute } from "@tanstack/react-router";
import { apiUrl } from "@/lib/uc.server";
import { saveRecord } from "@/lib/mongoDbService";
import { extractCleanId, parseLectureItem } from "@/lib/syncWorker";
import { GOALS } from "@/lib/uc";

const SAFE_HEADERS = {
  "content-type": "application/json",
  "cache-control": "public, max-age=120",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};

export const Route = createFileRoute("/api/public/uc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action") || "";
        const rawGoalUid =
          url.searchParams.get("goal_uid") || url.searchParams.get("categoryUid") || "";
        const rawUsername =
          url.searchParams.get("username") ||
          url.searchParams.get("educator") ||
          url.searchParams.get("teacher") ||
          "";
        const rawUid =
          url.searchParams.get("uid") ||
          url.searchParams.get("courseUid") ||
          url.searchParams.get("id") ||
          "";
        const type = url.searchParams.get("type") === "latest" ? "latest" : "popular";
        const offset = url.searchParams.get("offset") || "0";

        if (!action) {
          return new Response(JSON.stringify({ error: "Missing action parameter" }), {
            status: 400,
            headers: SAFE_HEADERS,
          });
        }

        let qs = "";
        if (action === "teachers" || action === "educators") {
          const goalUid = extractCleanId(rawGoalUid).toUpperCase();
          if (!goalUid) {
            return new Response(JSON.stringify({ error: "Missing goal_uid" }), {
              status: 400,
              headers: SAFE_HEADERS,
            });
          }
          qs = new URLSearchParams({ action: "teachers", goal_uid: goalUid, offset }).toString();
        } else if (action === "courses" || action === "batches") {
          const cleanUser = rawUsername.replace(/^@/, "").trim().toLowerCase();
          if (!cleanUser) {
            return new Response(JSON.stringify({ error: "Missing username" }), {
              status: 400,
              headers: SAFE_HEADERS,
            });
          }
          qs = new URLSearchParams({
            action: "courses",
            username: cleanUser,
            type,
            offset,
          }).toString();
        } else if (action === "lectures" || action === "lessons") {
          const cleanUid = extractCleanId(rawUid);
          if (!cleanUid) {
            return new Response(JSON.stringify({ error: "Missing uid" }), {
              status: 400,
              headers: SAFE_HEADERS,
            });
          }
          qs = new URLSearchParams({ action: "lectures", uid: cleanUid }).toString();
        } else {
          return new Response(JSON.stringify({ error: "Unsupported action" }), {
            status: 400,
            headers: SAFE_HEADERS,
          });
        }

        interface UpstreamResponse {
          results?: unknown[];
          count?: number;
          [key: string]: unknown;
        }

        const upstream = await fetch(apiUrl(qs), {
          headers: { accept: "application/json" },
        });
        if (!upstream.ok) throw new Error(`Upstream API error: ${upstream.status}`);
        const data = (await upstream.json()) as UpstreamResponse;

        // 1. Teachers: Normalize & Save to DB
        if ((action === "teachers" || action === "educators") && Array.isArray(data?.results)) {
          const goalUid = extractCleanId(rawGoalUid).toUpperCase();
          const goalInfo = GOALS[goalUid] || [goalUid, "📚"];

          saveRecord(
            "categories",
            { uid: goalUid },
            { uid: goalUid, name: goalInfo[0], emoji: goalInfo[1], goal_uid: goalUid },
          ).catch(() => {});

          for (const t of data.results) {
            const item = t as Record<string, unknown>;
            const u = String(item.username || item.slug || "")
              .toLowerCase()
              .replace(/^@/, "")
              .trim();
            if (u) {
              saveRecord(
                "educators",
                { username: u },
                {
                  ...item,
                  username: u,
                  categoryUid: goalUid,
                  goal_uid: goalUid,
                  categoryName: goalInfo[0],
                },
              ).catch(() => {});
            }
          }
        }

        // 2. Courses: Normalize & Save to DB
        if ((action === "courses" || action === "batches") && Array.isArray(data?.results)) {
          const cleanUser = rawUsername.replace(/^@/, "").trim().toLowerCase();
          for (const c of data.results) {
            const item = c as Record<string, unknown>;
            const courseUid = String(item.uid || item.id || item.course_uid || "");
            if (courseUid) {
              const authorObj = (item.author || {}) as Record<string, unknown>;
              const authName =
                `${String(authorObj.first_name || "")} ${String(authorObj.last_name || "")}`.trim() ||
                cleanUser;
              saveRecord(
                "courses",
                { uid: courseUid },
                {
                  ...item,
                  uid: courseUid,
                  course_uid: courseUid,
                  educatorUsername: cleanUser,
                  educatorName: authName,
                },
              ).catch(() => {});
            }
          }
        }

        // 3. Lectures: Normalize, Parse Videos/PDFs & Save to DB
        if ((action === "lectures" || action === "lessons") && Array.isArray(data?.results)) {
          const cleanCourseUid = extractCleanId(rawUid);
          const normalizedLectures = (data.results as unknown[]).map((rawLec) => {
            const normalized = parseLectureItem(rawLec, cleanCourseUid);
            // Background save to local/mongo store
            saveRecord(
              "lectures",
              { uid: normalized.uid, courseUid: cleanCourseUid },
              normalized as unknown as Record<string, unknown>,
            ).catch(() => {});
            return {
              title: normalized.title,
              author: normalized.author,
              started_at: normalized.started_at,
              pdf: normalized.pdf,
              video_url: normalized.video_url,
              token: normalized.video_url,
            };
          });

          data.results = normalizedLectures;
        }

        return new Response(JSON.stringify(data), { headers: SAFE_HEADERS });
      },
    },
  },
});
