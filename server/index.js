// server/index.js
const express = require('express');
const forge = require('node-forge');
const http = require('http');
const socketIo = require('socket.io');
const {
  generateRSAKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  generateAESKey,
  encryptAES,
  decryptAES,
} = require('./crypto/crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const userSessions = {}; // Stores RSA keypairs and AES keys per client



io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);

  // Step 1: Generate server-side RSA key pair
  const keyPair = await generateRSAKeyPair();
  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

  userSessions[socket.id] = { privateKeyPem };

  // Step 2: Send server's RSA public key to client
  socket.emit('server-public-key', publicKeyPem);

  // Step 3: Receive AES session key encrypted with server's public key
  socket.on('client-send-encrypted-aes', (encryptedAES) => {
    const aesKey = decryptWithPrivateKey(privateKeyPem, encryptedAES);
    userSessions[socket.id].aesKey = aesKey;
    console.log('Received AES key from client.');
    socket.emit('secure-session-ready');
  });

  // Step 4: Receive encrypted message from client and decrypt
  socket.on('secure-message', ({ iv, data }) => {
    const aesKey = userSessions[socket.id]?.aesKey;
    if (!aesKey) return console.warn('Missing AES key for:', socket.id);
    const plainText = decryptAES(aesKey, iv, data);
    console.log(`Decrypted message from ${socket.id}: ${plainText}`);

    // Echo back encrypted message to sender
    const encryptedReply = encryptAES(aesKey, `Echo: ${plainText}`);
    socket.emit('secure-reply', encryptedReply);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete userSessions[socket.id];
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
