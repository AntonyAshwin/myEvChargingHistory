export default async (req) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }
  return Response.json({
    adminToken: process.env.GITHUB_TOKEN || ""
  }, {
    headers: { "Cache-Control": "no-store" }
  });
};

export const config = { path: "/api/config" };
