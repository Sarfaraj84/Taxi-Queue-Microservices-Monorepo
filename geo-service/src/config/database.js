const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

// PostGIS extension setup
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');
    client.release();
    console.log('PostGIS extensions enabled');
  } catch (error) {
    console.error('Error enabling PostGIS:', error);
  }
};

module.exports = { pool, initDatabase };
