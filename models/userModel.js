const pool = require('../config/db');

// Optional: Create users table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT false,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expiry TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      is_admin BOOLEAN DEFAULT false,
      token_expiry TIMESTAMP
    )
  `;
  await pool.query(query);
};

// Add a new user
const addUser = async ({ username, email, password, verification_token }) => {
  const query = `
    INSERT INTO users (username, email, password, verification_token)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [username, email, password, verification_token];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Get user by ID
const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Verify user
const verifyUser = async (email) => {
  const query = `
    UPDATE users
    SET is_verified = true, verification_token = NULL
    WHERE email = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

// Set password reset token
const setResetToken = async (email, token, expiry) => {
  const query = `
    UPDATE users
    SET reset_token = $1, reset_token_expiry = $2
    WHERE email = $3
    RETURNING *
  `;
  const { rows } = await pool.query(query, [token, expiry, email]);
  return rows[0];
};

// Reset password
const resetPassword = async (email, newPassword) => {
  const query = `
    UPDATE users
    SET password = $1, reset_token = NULL, reset_token_expiry = NULL
    WHERE email = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [newPassword, email]);
  return rows[0];
};

// Delete user by ID
const deleteUserById = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  createUsersTable,
  addUser,
  getUserByEmail,
  getUserById,
  verifyUser,
  setResetToken,
  resetPassword,
  deleteUserById
};
