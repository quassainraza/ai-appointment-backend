import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 1. Create the database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 2. Pass the pool to the Prisma adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma with the adapter
export const prisma = new PrismaClient({ adapter });
