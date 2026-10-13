import { createDb } from "../src/db.js";
import { loadEnv } from "../src/env.js";
import { hashPassword } from "../src/lib/password.js";
import { seedProducts } from "./seed-products.js";

const env = loadEnv();
const db = createDb(env.DATABASE_URL);

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD missing, admin account skipped");
    return;
  }
  const passwordHash = await hashPassword(password);
  await db.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, passwordHash, name: "Admin", role: "ADMIN" },
  });
  console.log(`Admin account ready: ${email}`);
}

console.log(`Seeded ${await seedProducts(db)} demo products`);
await seedAdmin();
await db.$disconnect();
