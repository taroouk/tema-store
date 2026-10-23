/**
 * Creates (or updates) admin accounts in Supabase Auth + the AdminUser table.
 * Reads credentials from ./admins.local.json (gitignored). See admins.example.json.
 *
 *   npm run db:seed:admins
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const Admins = z.array(
  z.object({
    email: z.string().email(),
    password: z.string().min(10, "password must be at least 10 characters"),
    name: z.string().min(1),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "SUPPORT"]),
  })
);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function findUserId(email: string) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  const admins = Admins.parse(JSON.parse(readFileSync("admins.local.json", "utf8")));

  for (const a of admins) {
    let id = await findUserId(a.email);
    if (id) {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: a.password,
        email_confirm: true,
      });
      if (error) throw error;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: a.email,
        password: a.password,
        email_confirm: true,
      });
      if (error) throw error;
      id = data.user.id;
    }

    await prisma.adminUser.upsert({
      where: { id },
      update: { email: a.email, name: a.name, role: a.role, isActive: true },
      create: { id, email: a.email, name: a.name, role: a.role },
    });
    console.log(`✔ ${a.email} (${a.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
