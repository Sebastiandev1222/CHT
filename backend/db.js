require("dotenv").config(); // MUST be first line

const { Pool } = require("pg");

// Debug: confirm env is loaded
console.log("ENV CHECK:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env file");
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await db.connect();

    console.log("✅ Connected to PostgreSQL");

    const result = await client.query("SELECT NOW()");
    console.log("🕒 DB Time:", result.rows[0]);

    client.release();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();

module.exports = db;