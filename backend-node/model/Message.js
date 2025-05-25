const pool = require('../config/db');
const { encryptWithPublicKey, decryptWithPrivateKey } = require('../utils/cryptoUtil');
const { generateRSAKeyPair } = require('../utils/encryption');
const { v4: uuidv4 } = require('uuid');

async function getPublicKey(userId) {
  const res = await pool.query('SELECT public_key FROM user_keys WHERE user_id = $1', [userId]);
  if (res.rowCount === 0) throw new Error('Public key not found');
  return res.rows[0].public_key;
}

async function ensureUserKeyPair(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await pool.query('SELECT public_key FROM user_keys WHERE user_id = $1', [userId]);
  if (res.rowCount === 0) {
    const { publicKey, privateKey } = generateRSAKeyPair();
    await pool.query(
      'INSERT INTO user_keys (user_id, public_key, private_key) VALUES ($1, $2, $3)',
      [userId, publicKey, privateKey]
    );
    return publicKey;
  }
  return res.rows[0].public_key;
}

async function createMessage(senderId, receiverId, body) {
  const senderPublicKey = await getPublicKey(senderId);
  const recipientPublicKey = await getPublicKey(receiverId);

  // Encrypt for sender
  const senderEncrypted = encryptWithPublicKey(senderPublicKey, body);
  // Encrypt for recipient
  const recipientEncrypted = encryptWithPublicKey(recipientPublicKey, body);

  const id = uuidv4();
  const timestamp = new Date().toISOString();

  await pool.query(
    `INSERT INTO messages (
      id, sender_id, recipient_id,
      sender_encrypted_key, sender_iv, sender_encrypted_data,
      recipient_encrypted_key, recipient_iv, recipient_encrypted_data,
      timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id, senderId, receiverId,
      senderEncrypted.encryptedKey, senderEncrypted.iv, senderEncrypted.encryptedData,
      recipientEncrypted.encryptedKey, recipientEncrypted.iv, recipientEncrypted.encryptedData,
      timestamp
    ]
  );

  // Decrypt for sender so the frontend can show the message immediately
  const senderKeyRes = await pool.query('SELECT private_key FROM user_keys WHERE user_id = $1', [senderId]);
  const senderPrivateKey = senderKeyRes.rows[0].private_key;
  const senderBody = decryptWithPrivateKey(
    senderPrivateKey,
    senderEncrypted.encryptedKey,
    senderEncrypted.iv,
    senderEncrypted.encryptedData
  );

  return {
    id,
    senderId,
    receiverId,
    body: senderBody,
    timestamp
  };
}

async function getMessagesByUser(userId) {
  // Get user's private key
  const keyRes = await pool.query('SELECT private_key FROM user_keys WHERE user_id = $1', [userId]);
  if (keyRes.rowCount === 0) throw new Error('Private key not found');
  const privateKey = keyRes.rows[0].private_key;

  const res = await pool.query(
  `SELECT m.id,
          m.sender_id AS "from", m.recipient_id AS "to",
          su.username AS sender_username, ru.username AS recipient_username,
          m.sender_encrypted_key, m.sender_iv, m.sender_encrypted_data,
          m.recipient_encrypted_key, m.recipient_iv, m.recipient_encrypted_data,
          m.timestamp
   FROM messages m
   JOIN users su ON m.sender_id = su.id
   JOIN users ru ON m.recipient_id = ru.id
   WHERE m.sender_id = $1 OR m.recipient_id = $1
   ORDER BY m.timestamp DESC`,
  [userId]
);

  // Decrypt with the correct payload
  const messages = res.rows.map(msg => {
    let body;
    if (msg.to === userId) {
      body = decryptWithPrivateKey(privateKey, msg.recipient_encrypted_key, msg.recipient_iv, msg.recipient_encrypted_data);
    } else if (msg.from === userId) {
      body = decryptWithPrivateKey(privateKey, msg.sender_encrypted_key, msg.sender_iv, msg.sender_encrypted_data);
    }
    return {
      id: msg.id,
      senderId: msg.from,
      receiverId: msg.to,
      senderUsername: msg.sender_username,
      receiverUsername: msg.recipient_username,
      body,
      timestamp: msg.timestamp
    };
  });

  return messages;
}

async function deleteMessage(messageId, userId) {
  const res = await pool.query(
    `DELETE FROM messages WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );
  if (res.rowCount === 0) throw new Error('Message not found or not authorized');
}

async function updateMessage(messageId, userId, newBody) {
  const recipientRes = await pool.query(
    `SELECT recipient_id FROM messages WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );
  if (recipientRes.rowCount === 0) throw new Error('Message not found or not authorized');

  const recipientId = recipientRes.rows[0].recipient_id;
  const senderPublicKey = await getPublicKey(userId);
  const recipientPublicKey = await getPublicKey(recipientId);

  const senderEncrypted = encryptWithPublicKey(senderPublicKey, newBody);
  const recipientEncrypted = encryptWithPublicKey(recipientPublicKey, newBody);

  await pool.query(
    `UPDATE messages SET
      sender_encrypted_key = $1,
      sender_iv = $2,
      sender_encrypted_data = $3,
      recipient_encrypted_key = $4,
      recipient_iv = $5,
      recipient_encrypted_data = $6
     WHERE id = $7 AND sender_id = $8`,
    [
      senderEncrypted.encryptedKey, senderEncrypted.iv, senderEncrypted.encryptedData,
      recipientEncrypted.encryptedKey, recipientEncrypted.iv, recipientEncrypted.encryptedData,
      messageId, userId
    ]
  );
}

module.exports = {
  createMessage,
  getMessagesByUser,
  deleteMessage,
  updateMessage,
  ensureUserKeyPair
};