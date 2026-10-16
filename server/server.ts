import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { getDb } from "./config/db";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const db = await getDb();
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Padmanabha Fabrics E-Commerce API Server`);
      console.log(` Running on: http://localhost:${PORT}`);
      console.log(` Database:   ${db.isMySQL ? "MySQL / TiDB Cloud" : "Local Development Engine"}`);
      console.log(` Health:     http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = () => {
      console.log("\n[Server] Gracefully shutting down...");
      server.close(() => {
        console.log("[Server] Closed HTTP connections.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err: any) {
    console.error("[Server] Fatal startup error:", err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default createApp;
