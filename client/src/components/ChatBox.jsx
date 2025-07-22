import { useEffect, useState,useRef } from 'react';
import io from 'socket.io-client';
import forge from 'node-forge';

import {
  generateRSAKeyPair,
  generateAESKey,
  encryptAESKeyWithServerPublicKey,
  encryptMessage,
  decryptMessage,
} from '../utils/crypto';




export default function ChatBox() {
  const socketRef = useRef(null); 
  const [aesKey, setAESKey] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [privateKeyPem, setPrivateKeyPem] = useState(null);
  const [serverPublicKey, setServerPublicKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const socket = io('http://localhost:3001', {
  transports: ['websocket'], // force pure WebSocket
});

socketRef.current = socket;

console.log('✅ socketRef.current assigned:', socketRef.current);

    async function setupKeys() {
      const { privateKeyPem, publicKeyPem } = await generateRSAKeyPair();
      setPrivateKeyPem(privateKeyPem);
    }
    setupKeys();

socket.on('server-public-key', async (key) => {
  setServerPublicKey(key);

  const aes = generateAESKey();
  setAESKey(aes);

  const encryptedAES = encryptAESKeyWithServerPublicKey(key, aes);

  if (socket.connected) {
    socket.emit('client-send-encrypted-aes', encryptedAES);
    setSessionReady(true); // ✅ Mark session as secure + connected
  } else {
    console.warn('⚠️ Socket not yet connected when attempting to emit AES key');
  }

  // Secure reply listener AFTER aes is ready
  socket.on('secure-reply', ({ iv, data }) => {
    if (!aes) return console.warn('AES not ready yet');
    const msg = decryptMessage(aes, iv, data);
    setMessages((prev) => [...prev, { from: 'Server', text: msg }]);
  });
});



    socket.on('secure-session-ready', () => {
      console.log('Secure session established');
    });

//     socket.on('secure-reply', ({ iv, data }) => {
//   if (!aesKey) {
//     console.warn('🔒 AES key not ready, skipping decryption');
//     return;
//   }

//   const msg = decryptMessage(aesKey, iv, data);
//   setMessages((prev) => [...prev, { from: 'Server', text: msg }]);
// });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
  if (!aesKey || input.trim() === '') {
    alert('Encryption key not ready or message is empty');
    return;
  }

  if (!socketRef.current) {
    alert('Socket connection not ready yet.');
    return;
  }

  const { iv, data } = encryptMessage(aesKey, input);
  socketRef.current.emit('secure-message', { iv, data });
  setMessages((prev) => [...prev, { from: 'You', text: input }]);
  setInput('');
};


  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2">🔐 Secure Chat</h1>
      <div className="border p-3 h-60 overflow-y-scroll rounded mb-2 bg-gray-100">
        {messages.map((msg, i) => (
          <div key={i}><strong>{msg.from}:</strong> {msg.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border flex-grow px-2 py-1 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a secure message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
