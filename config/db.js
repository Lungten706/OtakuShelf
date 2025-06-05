// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
  rejectUnauthorized: false // needed for Render production DBs
  } 
});

pool.connect()
  .then(() => console.log('PostgreSQL Pool Connected'))
  .catch(err => console.error('Connection Error:', err.stack));

module.exports = pool;
