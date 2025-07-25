
# Secure Socket-Based Messaging Application with RSA Key Exchange and AES-CBC Encryption

## Overview
This is a **secure socket-based messaging application** that uses **RSA key exchange** for secure session setup and **AES-CBC encryption** to encrypt the message content. The application operates on a **WebSocket** connection, ensuring real-time secure messaging between clients and server.

### Key Features:
- **RSA Key Exchange** for securely sharing an AES session key.
- **AES-CBC encryption** for message payload confidentiality.
- **WebSocket** for real-time messaging.

---

## Technology Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO
- **Cryptography**: node-forge (for RSA and AES encryption)
- **Real-time Communication**: Socket.IO for WebSocket handling

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **React.js** (for frontend)

You can install **Node.js** from the official website:  
[https://nodejs.org/](https://nodejs.org/)

### Install dependencies

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install server-side dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client-side dependencies:
   ```bash
   cd client
   npm install
   ```

---

## Running the Application

### 1. **Start the Backend Server**

Navigate to the `server` directory and run:

```bash
cd server
npm run dev
```

This will start the **backend server** on `http://localhost:3001`. The server uses **WebSocket** through **Socket.IO** to handle real-time communication between the client and server.

- **Server Port**: 3001 (You can modify this in `server/index.js`)

### 2. **Start the Frontend Application**

Navigate to the `client` directory and run:

```bash
cd client
npm run dev
```

This will start the **frontend application** using **Vite** on `http://localhost:5173` (default port).

- **Client Port**: 5173 (You can modify this in `vite.config.js` if needed)

---

## Configurations

### **CORS Configuration**

To allow communication between the frontend and backend, CORS must be configured properly on the backend. The following configuration allows requests from any origin:

```js
const io = socketIo(server, {
  cors: {
    origin: '*', // Allows requests from any origin (you can change this to specific domains for better security)
    methods: ['GET', 'POST']
  }
});
```

This configuration is set in `server/index.js`. You can restrict the `origin` in production to specific domains for better security.

### **Ports**
- **Backend Port**: `3001`
- **Frontend Port**: `5173` (default Vite port)
  - You can modify the frontend port in `vite.config.js` if needed.

---

## Running in Production

For production deployment, ensure to:
1. Set environment variables securely (e.g., for RSA key generation, AES encryption).
2. Configure **reverse proxies** like **Nginx** or **Apache** to handle traffic.
3. Set **CORS** restrictions to only allow trusted domains.

Make sure to:
- Use **HTTPS** for encryption in production to prevent Man-in-the-Middle (MITM) attacks.
- Deploy the backend and frontend on separate servers or under a single reverse proxy.

---

## Troubleshooting

### WebSocket Connection Issues
If you're getting WebSocket connection errors, verify the following:
1. Ensure that the **client** and **server** are running on different ports.
2. Make sure that the **CORS** settings in `server/index.js` are correctly configured.
3. Verify that **socket.io** versions are matching on both frontend and backend.

You can check the **client** logs by opening the browser's Developer Tools and inspecting the **Console** and **Network** tabs for WebSocket issues.

---

## Project Structure

### Backend (`server/`)
- **`index.js`**: Main backend server file, handles WebSocket connections and cryptography.
- **`crypto/crypto.js`**: Contains RSA key exchange and AES encryption/decryption logic.

### Frontend (`client/`)
- **`src/App.jsx`**: Main component for the React application.
- **`src/components/ChatBox.jsx`**: Handles the chat interface, message encryption/decryption.
- **`src/utils/crypto.js`**: Contains client-side cryptographic functions (RSA key generation, AES encryption).

---

## Future Work

- **User Authentication**: Integrate authentication and authorization for user management.
- **Group Messaging**: Extend the app to support encrypted group messaging.
- **Message Integrity**: Add HMAC to ensure message integrity and authentication.

---


## Conclusion

You’ve now set up a secure socket-based messaging application that uses **RSA** for key exchange and **AES-CBC** for encryption, ensuring privacy and data protection during communication. 

Enjoy building secure, real-time applications! 🔐
