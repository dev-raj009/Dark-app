import { createFileRoute } from "@tanstack/react-router";
import { mediaUrl, verifyMedia } from "@/lib/uc.server";

const ALLOWED = new Set(["output.webm", "output.mp4", "data.json", "securejson.json"]);

export const Route = createFileRoute("/api/public/media/$token/$file")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { token, file } = params as { token: string; file: string };
        if (!ALLOWED.has(file)) return new Response("Not found", { status: 404 });

        const uid = await verifyMedia(token);
        if (!uid) return new Response("Forbidden", { status: 403 });

        const range = request.headers.get("range");
        const upstreamUrl = mediaUrl(uid, file);

        try {
          const upstream = await fetch(upstreamUrl, {
            headers: {
              ...(range ? { range } : {}),
              referer: "https://unacademy.com/",
              "user-agent":
                request.headers.get("user-agent") ||
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (!upstream.ok && upstream.status !== 206) {
            return new Response(`Upstream returned ${upstream.status}`, {
              status: upstream.status,
              headers: {
                "access-control-allow-origin": "*",
              },
            });
          }

          const headers = new Headers();
          for (const h of [
            "content-length",
            "content-range",
            "accept-ranges",
            "etag",
            "last-modified",
          ]) {
            const v = upstream.headers.get(h);
            if (v) headers.set(h, v);
          }

          // Explicit correct MIME types for browsers to play video and parse json without blocking
          if (file.endsWith(".webm")) {
            headers.set("content-type", "video/webm");
          } else if (file.endsWith(".mp4")) {
            headers.set("content-type", "video/mp4");
          } else if (file.endsWith(".json")) {
            headers.set("content-type", "application/json; charset=utf-8");
          } else {
            const ct = upstream.headers.get("content-type");
            if (ct) headers.set("content-type", ct);
          }

          headers.set("accept-ranges", "bytes");
          headers.set("cache-control", "public, max-age=86400");
          headers.set("access-control-allow-origin", "*");
          headers.set("referrer-policy", "no-referrer");

          return new Response(upstream.body, {
            status: upstream.status,
            headers,
          });
        } catch (err) {
          console.error(`[Media Proxy] Error fetching ${upstreamUrl}:`, err);
          return new Response("Media fetch failed", { status: 502 });
        }
      },
    },
  },
});
