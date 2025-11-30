import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define audio object outside the component for efficiency
const hoverAudio = new Audio('/hover.mp3');
hoverAudio.volume = 0.4;

const playHoverSound = () => {
    try {
        hoverAudio.currentTime = 0;
        hoverAudio.play();
    } catch (e) { }
};

const INITIAL_MOTIVATION = "Masukkan ID anda dan bantu Algo memulihkan CodeCity!";
const ERROR_MESSAGE = "Kata laluan salah. Sila cuba lagi!";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [robotMessage, setRobotMessage] = useState(INITIAL_MOTIVATION);

  // Set the initial message when the component mounts
  useEffect(() => {
    setRobotMessage(INITIAL_MOTIVATION);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setRobotMessage("Sedang menyemak identiti..."); // Message while loading

    try {
      const response = await fetch('https://algoquest-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/game'; 
      } else {
        // Show error message from the robot
        setRobotMessage(ERROR_MESSAGE); 
        // Reset the message after 3 seconds
        setTimeout(() => setRobotMessage(INITIAL_MOTIVATION), 3000); 
      }
    } catch (err) {
      console.error(err);
      setRobotMessage("Gagal menghubungi pelayan. Pastikan pelayan Node.js berjalan.");
      setTimeout(() => setRobotMessage(INITIAL_MOTIVATION), 4000);
    }
  };

  return (
    <div className="auth-form">
      {/* 1. Robot Chat Bubble Structure */}
      <div className="robot-speech-container">
        <div className="robot-speech-bubble">
          {/* 2. Apply the simple CSS fade-in animation */}
          <span className="message-reveal">{robotMessage}</span>
        </div>
      </div>
      
      <h2>Log Masuk</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID Pengguna (Emel): </label>
          <input type="email" placeholder="Masukkan emel anda" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Kata Laluan: </label>
          <input type="password" placeholder="Masukkan kata laluan" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" onMouseEnter={playHoverSound}>Log Masuk</button>
      </form>
      <p>Belum ada akaun? <Link to="/register">Daftar di sini</Link></p>
      <p>Lupa kata laluan? Klik sini</p>
    </div>
  );
}

export default Login;