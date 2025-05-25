const pool = require('../config/db');

async function saveUserKey(userId, publicKey) {
  const result = await pool.query(
    'INSERT INTO user_keys (userId, publicKey) VALUES ($1, $2) ON CONFLICT (userId) DO UPDATE SET publicKey = EXCLUDED.publicKey RETURNING *',
    [userId, publicKey]
  );
  return result.rows[0];
}

async function getUserKey(userId) {
  const result = await pool.query(
    'SELECT publicKey FROM user_keys WHERE userId = $1',
    [userId]
  );
  return result.rows[0]?.publickey;
}

module.exports = {
  saveUserKey,
  getUserKey,
};
