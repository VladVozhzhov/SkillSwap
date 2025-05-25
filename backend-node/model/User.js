const pool = require('../config/db');

async function createUser(username, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING *',
    [username, passwordHash]
  );
  return result.rows[0];
}

async function getUserByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  getUserByUsername,
};
