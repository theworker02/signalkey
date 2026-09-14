import http from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Service } from "./service";
export async function startApi(service: Service) {
  const token = randomBytes(32).toString("hex");
  let windowStart = performance.now();
  let requests = 0;
  const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    const auth = Buffer.from(req.headers.authorization ?? "");
    const expected = Buffer.from(`Bearer ${token}`);
    if (
      req.headers.origin ||
      auth.length !== expected.length ||
      !timingSafeEqual(auth, expected)
    ) {
      res.writeHead(403).end(JSON.stringify({ error: "FORBIDDEN" }));
      return;
    }
    if (performance.now() - windowStart >= 1000) {
      windowStart = performance.now();
      requests = 0;
    }
    if (++requests > 30) {
      res.writeHead(429).end(JSON.stringify({ error: "RATE_LIMIT" }));
      return;
    }
    try {
      let data = "";
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 8192) {
          res.writeHead(413).end();
          return;
        }
        data += chunk;
      }
      let value: unknown;
      if (req.method === "GET" && req.url === "/status")
        value = service.snapshot();
      else if (req.method === "GET" && req.url === "/devices")
        value = await service.devices();
      else if (req.method === "POST" && req.url === "/run") {
        const input = JSON.parse(data);
        if (typeof input.id !== "string")
          throw new Error("Profile id required");
        const p = service.profiles.find((p) => p.id === input.id);
        if (!p?.enabled || service.busy)
          throw new Error("Profile disabled, missing, or runner busy");
        void service.run(input.id, "sdk").catch((e) => service.error(e));
        value = { accepted: true };
      } else if (req.method === "POST" && req.url === "/light") {
        service.light(JSON.parse(data).state);
        value = { accepted: true, expiresInMs: 6000 };
      } else if (req.method === "GET" && req.url === "/events") {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        const send = (g: string) =>
          res.write(`data: ${JSON.stringify({ gesture: g })}\n\n`);
        service.on("press", send);
        const pulse = setInterval(() => res.write(": heartbeat\n\n"), 2000);
        res.on("close", () => {
          clearInterval(pulse);
          service.off("press", send);
        });
        return;
      } else {
        res.writeHead(404).end(JSON.stringify({ error: "NOT_FOUND" }));
        return;
      }
      res.end(JSON.stringify(value));
    } catch (e) {
      if (!res.destroyed && !res.headersSent)
        res.writeHead(400).end(JSON.stringify({ error: String(e) }));
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.maxConnections = 16;
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("LOCAL_API_FAILED");
  const connection = { url: `http://127.0.0.1:${address.port}`, token };
  await writeFile(
    path.join(service.directory, "sdk.json"),
    JSON.stringify(connection),
    { mode: 0o600 },
  );
  return { server, connection };
}
