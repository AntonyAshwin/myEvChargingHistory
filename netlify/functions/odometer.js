import { getStore } from "@netlify/blobs";

const DEFAULT_ODO = 1980;

export default async (req) => {
  const store = getStore("ev-charging");

  if (req.method === "GET") {
    const val = await store.get("odometer", { type: "json" });
    return Response.json({ odometer: val ?? DEFAULT_ODO }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (req.method === "POST") {
    const body = await req.json();
    if (typeof body.odometer !== "number" || body.odometer < 0) {
      return new Response("Invalid value", { status: 400 });
    }
    await store.setJSON("odometer", body.odometer);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/odometer" };
