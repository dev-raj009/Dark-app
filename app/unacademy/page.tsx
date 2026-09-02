"use client";

const APP_URL =
  process.env.NEXT_PUBLIC_UNACADEMY_APP_URL || "http://localhost:3001";

export default function UnacademyPage() {
  return (
    <main style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#fff" }}>
      <iframe
        title="Unacademy"
        src={APP_URL}
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        allow="autoplay; fullscreen; picture-in-picture"
      />
    </main>
  );
}
