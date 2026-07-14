import { getStore } from "@netlify/blobs";

const OWNER = "AntonyAshwin";
const REPO = "myEvChargingHistory";
const PATH = "backup/sessions.json";
const BRANCH = "main";

export default async () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("backup: GITHUB_TOKEN not set");
    return new Response("GITHUB_TOKEN not set", { status: 500 });
  }

  // Read current sessions and odometer from Blobs
  const store = getStore("ev-charging");
  const [sessions, odoValue] = await Promise.all([
    store.get("sessions", { type: "json" }),
    store.get("odometer", { type: "json" })
  ]);
  if (!sessions) {
    console.log("backup: no sessions to back up");
    return new Response("no data", { status: 200 });
  }

  const payload = { odometer: odoValue ?? 1980, sessions };
  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");
  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Get existing file SHA (needed to update)
  let sha;
  const getRes = await fetch(`${apiBase}?ref=${BRANCH}`, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.text();
    console.error("backup: GitHub GET failed", getRes.status, err);
    return new Response("GitHub GET failed", { status: 502 });
  }

  const now = new Date().toISOString();
  const body = {
    message: `backup: scheduled snapshot ${now}`,
    content,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    console.error("backup: GitHub PUT failed", putRes.status, err);
    return new Response("GitHub PUT failed", { status: 502 });
  }

  console.log(`backup: pushed ${sessions.length} sessions + odometer to GitHub at ${now}`);
  return new Response("ok", { status: 200 });
};

export const config = {
  schedule: "0 2 1,15 * *", // 2 AM UTC on 1st and 15th of every month
};
