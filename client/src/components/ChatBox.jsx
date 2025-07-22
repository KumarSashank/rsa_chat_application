import React, { useState, useEffect, useRef } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aesKey, setAESKey] = useState(null);
  const [serverPublicKey, setServerPublicKey] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket CONNECTED', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err.message);
    });

    socket.on('server-public-key', async (key) => {
      setServerPublicKey(key);
      const aes = generateAESKey();
      setAESKey(aes);
      const encryptedAES = encryptAESKeyWithServerPublicKey(key, aes);

      if (socket.connected) {
        socket.emit('client-send-encrypted-aes', encryptedAES);
        setSessionReady(true);
      } else {
        console.warn('⚠️ Socket not connected');
      }

      socket.on('secure-reply', ({ iv, data }) => {
        if (!aes) return console.warn('AES not ready');
        const msg = decryptMessage(aes, iv, data);
        const time = new Date().toLocaleTimeString();
        setMessages((prev) => [...prev, { from: 'Server', text: msg, time }]);
      });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!sessionReady || input.trim() === '') {
      alert('Secure session not ready or message empty');
      return;
    }

    const { iv, data } = encryptMessage(aesKey, input);
    socketRef.current.emit('secure-message', { iv, data });
    const time = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { from: 'You', text: input, time }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-700 text-white p-4 text-xl font-bold shadow">
        🔐 Secure Messenger
      </header>

      {!sessionReady && (
        <div className="bg-yellow-200 text-yellow-900 text-center p-2">
          Waiting for secure session to establish...
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] px-4 py-2 rounded-lg shadow whitespace-pre-wrap ${
              msg.from === 'You'
                ? 'bg-blue-500 text-white self-end ml-auto'
                : 'bg-gray-300 text-gray-900 self-start'
            }`}
          >
            <div className="text-sm font-medium">{msg.from}</div>
            <div className="text-sm">{msg.text}</div>
            <div className="text-xs text-right mt-1 opacity-70">{msg.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="p-4 flex gap-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your secure message..."
          className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring"
        />
        <button
          onClick={sendMessage}
          disabled={!sessionReady}
          className={`px-4 py-2 rounded text-white font-semibold ${
            sessionReady
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
