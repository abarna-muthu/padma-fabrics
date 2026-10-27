import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

import { createApp } from "../server/app";
import { Readable } from "node:stream";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

let expressAppInstance: any = null;
function getExpressApp() {
  if (!expressAppInstance) {
    expressAppInstance = createApp();
  }
  return expressAppInstance;
}

async function handleApiFetch(request: Request): Promise<Response> {
  return new Promise(async (resolve) => {
    try {
      const url = new URL(request.url);
      const expressApp = getExpressApp();
      const bodyBuffer =
        request.method !== "GET" && request.method !== "HEAD"
          ? Buffer.from(await request.arrayBuffer())
          : Buffer.alloc(0);

      const reqStream = new Readable({
        read() {
          if (bodyBuffer.length > 0) {
            this.push(bodyBuffer);
          }
          this.push(null);
        },
      });

      const req: any = Object.assign(reqStream, {
        url: url.pathname + url.search,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        connection: { remoteAddress: "127.0.0.1" },
        socket: { remoteAddress: "127.0.0.1" },
        originalUrl: url.pathname + url.search,
        query: Object.fromEntries(url.searchParams.entries()),
      });

      let statusCode = 200;
      const responseHeaders = new Headers();
      const chunks: Buffer[] = [];

      const res: any = {
        statusCode: 200,
        setHeader(name: string, value: any) {
          if (Array.isArray(value)) {
            responseHeaders.delete(name);
            value.forEach((v) => responseHeaders.append(name, String(v)));
          } else {
            responseHeaders.set(name, String(value));
          }
          return this;
        },
        getHeader(name: string) {
          return responseHeaders.get(name);
        },
        hasHeader(name: string) {
          return responseHeaders.has(name);
        },
        removeHeader(name: string) {
          responseHeaders.delete(name);
        },
        status(code: number) {
          statusCode = code;
          res.statusCode = code;
          return this;
        },
        writeHead(code: number, headers?: any) {
          statusCode = code;
          if (headers) {
            for (const [k, v] of Object.entries(headers)) {
              res.setHeader(k, v);
            }
          }
          return this;
        },
        write(chunk: any) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          return true;
        },
        end(chunk: any) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const totalBuffer = Buffer.concat(chunks);
          resolve(
            new Response(totalBuffer, {
              status: statusCode,
              headers: responseHeaders,
            }),
          );
        },
        on() {
          return this;
        },
        once() {
          return this;
        },
        emit() {
          return true;
        },
      };

      expressApp(req, res, (err: any) => {
        if (err) {
          resolve(
            new Response(JSON.stringify({ success: false, error: err.message || "Internal Server Error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }),
          );
        } else {
          resolve(
            new Response(JSON.stringify({ success: false, error: `API route not found: ${url.pathname}` }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
      });
    } catch (err: any) {
      resolve(
        new Response(JSON.stringify({ success: false, error: err.message || "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const captured = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(captured);
  return new Response(renderErrorPage(captured), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api")) {
      return await handleApiFetch(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
