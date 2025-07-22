// server/crypto/crypto.js
const forge = require('node-forge');

function generateRSAKeyPair() {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
      if (err) reject(err);
      else resolve(keypair);
    });
  });
}

function encryptWithPublicKey(publicKeyPem, data) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

function decryptWithPrivateKey(privateKeyPem, encryptedBase64) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  return privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
}

function generateAESKey() {
  return forge.random.getBytesSync(16); // 128-bit key
}

function encryptAES(aesKey, plainText) {
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(plainText, 'utf8'));
  cipher.finish();
  const encrypted = cipher.output.getBytes();
  return {
    iv: forge.util.encode64(iv),
    data: forge.util.encode64(encrypted),
  };
}

function decryptAES(aesKey, ivBase64, encryptedBase64) {
  const iv = forge.util.decode64(ivBase64);
  const encrypted = forge.util.decode64(encryptedBase64);
  const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  const result = decipher.finish();
  return result ? decipher.output.toString('utf8') : null;
}

module.exports = {
  generateRSAKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  generateAESKey,
  encryptAES,
  decryptAES,
};
