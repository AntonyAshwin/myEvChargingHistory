import { getStore } from "@netlify/blobs";

const DEFAULT_SESSIONS = [
  {
    date: "23 Jun 2026, 02:16 PM",
    displayName: "SAP Devanahalli Office Charging",
    type: "slow",
    startSoc: 34, endSoc: 86,
    energy: 18.20,
    rate: "₹5.62/kWh (BESCOM EV Tariff)",
    cost: 102.28,
    network: "BESCOM",
    chargerKw: 7.6,
    free: true
  },
  {
    date: "26 Jun 2026, 03:55 PM",
    displayName: "SAP Whitefield Office Charging",
    type: "slow",
    startSoc: 28, endSoc: 95,
    energy: 23.45,
    rate: "₹5.62/kWh (BESCOM EV Tariff)",
    cost: 131.79,
    network: "BESCOM",
    chargerKw: 7.6,
    free: true
  },
  {
    date: "03 Jul 2026, 07:29 AM",
    displayName: "SAP Whitefield Office Charging",
    type: "slow",
    startSoc: 33, endSoc: 100,
    energy: 23.45,
    rate: "₹5.62/kWh (BESCOM EV Tariff)",
    cost: 131.79,
    network: "BESCOM",
    chargerKw: 3.3,
    free: true
  },
  {
    date: "04 Jul 2026",
    displayName: "Zeon Charging (Session A)",
    type: "fast",
    startSoc: 33, endSoc: 81,
    energy: 20.29,
    rate: "₹27.50/kWh + 18% GST",
    cost: 658.42,
    network: "Zeon",
    chargerKw: 60
  },
  {
    date: "04 Jul 2026",
    displayName: "Zeon Charging (Session B)",
    type: "fast",
    startSoc: 81, endSoc: 84,
    energy: 1.16,
    rate: "₹27.50/kWh + 18% GST",
    cost: 37.64,
    network: "Zeon",
    chargerKw: 60
  },
  {
    date: "04 Jul 2026",
    displayName: "ESYGO Charging",
    type: "fast",
    startSoc: 34, endSoc: 79,
    energy: 18.59,
    rate: "₹18.00/kWh + 18% GST",
    cost: 394.85,
    network: "ESYGO",
    chargerKw: 60
  },
  {
    date: "09 Jul 2026, 02:41 PM",
    displayName: "Tata.ev Hyson motors Thrissur",
    type: "fast",
    startSoc: 14, endSoc: 71,
    energy: 24.398,
    rate: "Final Transaction Amount",
    cost: 512.36,
    network: "Tata.ev",
    chargerKw: 60
  },
  {
    date: "09 Jul 2026, 09:36 PM",
    displayName: "KSEB Home Slow Charging",
    type: "slow",
    startSoc: 47, endSoc: 100,
    energy: 18.55,
    rate: "₹7.00/kWh (Standard Domestic)",
    cost: 129.85,
    network: "KSEB",
    chargerKw: 3.3
  }
];

export default async (req) => {
  const store = getStore("ev-charging");

  if (req.method === "GET") {
    let data = await store.get("sessions", { type: "json" });
    if (!data) {
      data = DEFAULT_SESSIONS;
      await store.setJSON("sessions", data);
    }
    return Response.json(data, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (req.method === "POST") {
    const sessions = await req.json();
    if (!Array.isArray(sessions)) {
      return new Response("Invalid data", { status: 400 });
    }
    await store.setJSON("sessions", sessions);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/sessions" };
