const crypto = require('crypto');

function encryptWithPublicKey(publicKeyPem, message) {
  // Generate random AES key and IV
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // Encrypt the message with AES
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encryptedData = cipher.update(message, 'utf8', 'base64');
  encryptedData += cipher.final('base64');

  // Create publicKey object from PEM
  const publicKey = crypto.createPublicKey(publicKeyPem);

  // Encrypt the AES key with RSA
  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    aesKey
  ).toString('base64');

  return {
    encryptedKey,
    iv: iv.toString('base64'),
    encryptedData
  };
}

function decryptWithPrivateKey(privateKeyPem, encryptedKey, iv, encryptedData) {
  // Decrypt the AES key with RSA
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(encryptedKey, 'base64')
  );

  // Decrypt the message with AES
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encryptWithPublicKey,
  decryptWithPrivateKey
};