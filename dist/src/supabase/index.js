"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
// 1. Create the database connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
// 2. Pass the pool to the Prisma adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
// 3. Initialize Prisma with the adapter
exports.prisma = new client_1.PrismaClient({ adapter });
