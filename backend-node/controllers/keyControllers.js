
const pool = require('../config/db');

async function saveUserKey(userId, publicKey, senderEncryptionKey = null) {
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!publicKey) {
    throw new Error('publicKey is required');
  }

  const result = await pool.query(
      `INSERT INTO user_keys (user_id, public_key, sender_encryption_key)
       VALUES ($1, $2, $3)
         ON CONFLICT (user_id) 
     DO UPDATE SET
        public_key = EXCLUDED.public_key,
                   sender_encryption_key = COALESCE(EXCLUDED.sender_encryption_key, user_keys.sender_encryption_key)
                   RETURNING *`,
      [userId, publicKey, senderEncryptionKey]
  );

  return result.rows[0];
}

async function saveSenderEncryptionKey(userId, senderEncryptionKey) {
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!senderEncryptionKey) {
    throw new Error('senderEncryptionKey is required');
  }

  const result = await pool.query(
      `INSERT INTO user_keys (user_id, sender_encryption_key) 
     VALUES ($1, $2) 
     ON CONFLICT (user_id) 
     DO UPDATE SET sender_encryption_key = EXCLUDED.sender_encryption_key 
     RETURNING *`,
      [userId, senderEncryptionKey]
  );

  return result.rows[0];
}

async function getUserKey(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const result = await pool.query(
      'SELECT public_key, sender_encryption_key FROM user_keys WHERE user_id = $1',
      [userId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  // Convert snake_case to camelCase for JavaScript consistency
  return {
    publicKey: row.public_key,
    senderEncryptionKey: row.sender_encryption_key
  };
}

module.exports = {
  saveUserKey,
  saveSenderEncryptionKey,
  getUserKey,
};