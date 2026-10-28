// Manifest sync server.
//
// One Durable Object per list ("vault"). The vault id is a SHA-256 hash the app
// derives from your sync code, so the server never sees the code itself. Every
// record arrives already encrypted on your device; the server only stores
//   id  - item id (random, meaningless)
//   t   - when the item last changed (ms)
//   d   - 1 if the item was deleted
//   c   - the encrypted item (base64)
// and keeps the newest copy of each id. Connected devices get a nudge over a
// WebSocket whenever something changes, then pull what's new.

import { DurableObject } from "cloudflare:workers";

const VAULT_RE = /^[a-f0-9]{64}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_RECORDS = 5000;
const MAX_CIPHER = 40000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

export class Vault extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS records (
          id  TEXT PRIMARY KEY,
          t   INTEGER NOT NULL,
          d   INTEGER NOT NULL DEFAULT 0,
          c   TEXT NOT NULL,
          seq INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS records_seq ON records(seq);
        CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER NOT NULL);
      `);
    });
  }

  currentSeq() {
    const row = this.ctx.storage.sql.exec("SELECT v FROM meta WHERE k = 'seq'").toArray()[0];
    return row ? row.v : 0;
  }

  pull(since) {
    const records = this.ctx.storage.sql
      .exec("SELECT id, t, d, c FROM records WHERE seq > ? ORDER BY seq", since)
      .toArray();
    return { seq: this.currentSeq(), records };
  }

  push(records) {
    let seq = this.currentSeq();
    let changed = 0;
    for (const r of records) {
      const cur = this.ctx.storage.sql.exec("SELECT t FROM records WHERE id = ?", r.id).toArray()[0];
      // newest edit wins; on an exact tie the copy already stored stays
      if (cur && cur.t >= r.t) continue;
      seq += 1;
      changed += 1;
      this.ctx.storage.sql.exec(
        "INSERT INTO records (id, t, d, c, seq) VALUES (?, ?, ?, ?, ?) " +
          "ON CONFLICT(id) DO UPDATE SET t = excluded.t, d = excluded.d, c = excluded.c, seq = excluded.seq",
        r.id, r.t, r.d ? 1 : 0, r.c, seq
      );
    }
    if (changed) {
      this.ctx.storage.sql.exec(
        "INSERT INTO meta (k, v) VALUES ('seq', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", seq
      );
      const msg = JSON.stringify({ type: "changed", seq });
      for (const ws of this.ctx.getWebSockets()) {
        try { ws.send(msg); } catch (e) { /* socket already gone */ }
      }
    }
    return { seq, changed };
  }

  // WebSocket upgrades come in through fetch; everything else uses RPC.
  async fetch(request) {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "hello", seq: this.currentSeq() }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    if (message === "ping") ws.send("pong");
  }

  async webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch (e) { /* already closed */ }
  }
}

function validRecords(body) {
  if (!body || !Array.isArray(body.records) || body.records.length > MAX_RECORDS) return null;
  const out = [];
  for (const r of body.records) {
    if (!r || typeof r.id !== "string" || !ID_RE.test(r.id)) return null;
    if (!Number.isFinite(r.t) || r.t < 0) return null;
    if (typeof r.c !== "string" || r.c.length > MAX_CIPHER) return null;
    out.push({ id: r.id, t: Math.floor(r.t), d: !!r.d, c: r.c });
  }
  return out;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean); // v1 / <vault> / <action>
    if (parts.length === 0) return json({ ok: true, service: "manifest-sync" });
    if (parts[0] !== "v1" || parts.length !== 3 || !VAULT_RE.test(parts[1])) return json({ error: "not found" }, 404);
    const [, vault, action] = parts;
    const stub = env.VAULT.getByName(vault);

    if (action === "ws") {
      if (request.headers.get("Upgrade") !== "websocket") return json({ error: "expected websocket" }, 426);
      return stub.fetch(request);
    }
    if (action === "pull" && request.method === "GET") {
      const since = Math.max(0, parseInt(url.searchParams.get("since") || "0", 10) || 0);
      return json(await stub.pull(since));
    }
    if (action === "push" && request.method === "POST") {
      if (Number(request.headers.get("Content-Length") || 0) > 4_000_000) return json({ error: "too large" }, 413);
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const records = validRecords(body);
      if (!records) return json({ error: "bad records" }, 400);
      return json(await stub.push(records));
    }
    return json({ error: "not found" }, 404);
  },
};
