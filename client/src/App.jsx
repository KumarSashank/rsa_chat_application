import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import ChatBox from './components/ChatBox';

function App() {
  return (
    <div className="min-h-screen bg-gray-200">
      <ChatBox />
    </div>
  );
}

export default App;
