import forge from 'node-forge';

export function generateRSAKeyPair() {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
      if (err) reject(err);
      else resolve({
        publicKeyPem: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKeyPem: forge.pki.privateKeyToPem(keypair.privateKey),
        keypair,
      });
    });
  });
}

export function encryptAESKeyWithServerPublicKey(serverPublicKeyPem, aesKey) {
  const publicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
  const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

export function generateAESKey() {
  return forge.random.getBytesSync(16);
}

export function encryptMessage(aesKey, message) {
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, 'utf8'));
  cipher.finish();
  return {
    iv: forge.util.encode64(iv),
    data: forge.util.encode64(cipher.output.getBytes()),
  };
}

export function decryptMessage(aesKey, ivBase64, encryptedBase64) {
  const iv = forge.util.decode64(ivBase64);
  const encrypted = forge.util.decode64(encryptedBase64);
  const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  const result = decipher.finish();
  return result ? decipher.output.toString('utf8') : null;
}
