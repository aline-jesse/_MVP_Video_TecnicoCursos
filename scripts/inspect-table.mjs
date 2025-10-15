import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  await client.connect();
  const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'render_jobs' ORDER BY ordinal_position`);
  console.log(res.rows);
  await client.end();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
