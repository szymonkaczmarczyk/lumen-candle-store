import "dotenv/config";
import { execSync } from "node:child_process";

export default function setup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL is required for API tests");
  execSync("pnpm prisma migrate deploy", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}
