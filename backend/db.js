const { Pool } = require('pg');
require('dotenv').config();

// Estas credenciales son las mismas que usas para conectarte en pgAdmin.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wisp_pachanet',
});

module.exports = { pool };
