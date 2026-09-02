import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { signLesson, signMedia } from "@/lib/uc.server";

const Schema = z.object({
  url: z.string().optional(),
  uid: z.string().optional(),
});

const SAFE_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store, no-cache, must-revalidate",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export const Route = createFileRoute("/api/public/player-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const parsed = Schema.safeParse(body);
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: "Invalid payload" }), {
              status: 400,
              headers: SAFE_HEADERS,
            });
          }

          const { url, uid } = parsed.data;
          let token: string | null = null;

          if (uid && /^[A-Za-z0-9_-]{4,64}$/.test(uid)) {
            token = await signLesson(uid);
          } else if (url) {
            token = await signMedia(url);
            if (!token && url.includes("lesson-raw/")) {
              const m = /lesson-raw\/([A-Za-z0-9_-]+)/.exec(url);
              if (m) token = await signLesson(m[1]);
            }
          }

          if (!token) {
            return new Response(
              JSON.stringify({
                error: "Could not generate secure playback token for the provided source.",
              }),
              { status: 400, headers: SAFE_HEADERS },
            );
          }

          return new Response(
            JSON.stringify({
              token,
              expiresInHours: 24,
              mediaUrl: `/api/public/media/${token}/output.webm`,
              dataUrl: `/api/public/media/${token}/data.json`,
              secureJsonUrl: `/api/public/media/${token}/securejson.json`,
            }),
            { status: 200, headers: SAFE_HEADERS },
          );
        } catch (err) {
          console.error("[player-token] Token generation error:", err);
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: SAFE_HEADERS,
          });
        }
      },
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const rawUrl = u.searchParams.get("url") || "";
        const uid = u.searchParams.get("uid") || "";

        let token: string | null = null;
        if (uid && /^[A-Za-z0-9_-]{4,64}$/.test(uid)) {
          token = await signLesson(uid);
        } else if (rawUrl) {
          token = await signMedia(rawUrl);
          if (!token && rawUrl.includes("lesson-raw/")) {
            const m = /lesson-raw\/([A-Za-z0-9_-]+)/.exec(rawUrl);
            if (m) token = await signLesson(m[1]);
          }
        }

        if (!token) {
          return new Response(
            JSON.stringify({ error: "Invalid URL or UID for token generation" }),
            { status: 400, headers: SAFE_HEADERS },
          );
        }

        return new Response(
          JSON.stringify({
            token,
            expiresInHours: 24,
            mediaUrl: `/api/public/media/${token}/output.webm`,
            dataUrl: `/api/public/media/${token}/data.json`,
            secureJsonUrl: `/api/public/media/${token}/securejson.json`,
          }),
          { status: 200, headers: SAFE_HEADERS },
        );
      },
    },
  },
});
