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

const INITIAL_MOTIVATION = "Sila cipta akaun anda. Jom pulihkan Kampus Digital!";
const SUCCESS_MESSAGE = "Akaun berjaya didaftarkan! Sila log masuk.";

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [robotMessage, setRobotMessage] = useState(INITIAL_MOTIVATION);

  useEffect(() => {
    setRobotMessage(INITIAL_MOTIVATION);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRobotMessage("Memproses pendaftaran akaun..."); // Message while loading

    try {
      const response = await fetch('https://algoquest-api.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (data.id) { // Check for successful registration by looking for user ID
        // Show success message from the robot
        setRobotMessage(SUCCESS_MESSAGE);
        
        // Wait 2 seconds, then navigate
        setTimeout(() => {
            window.location.href = '/login'; 
        }, 2000); 

      } else {
        setRobotMessage("Pendaftaran gagal. Emel mungkin sudah wujud.");
        setTimeout(() => setRobotMessage(INITIAL_MOTIVATION), 4000);
      }

    } catch (err) {
      console.error(err);
      setRobotMessage("Gagal menghubungi pelayan. Sila semak sambungan anda.");
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

      <h2>Cipta Akaun Baharu</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nama: </label>
          <input type="text" placeholder="Masukkan nama anda" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Emel: </label>
          <input type="email" placeholder="Masukkan emel anda" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Kata Laluan: </label>
          <input type="password" placeholder="Masukkan kata laluan" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" onMouseEnter={playHoverSound}>Daftar Akaun</button>
      </form>
      <p>Sudah ada akaun? <Link to="/login">Log masuk di sini</Link></p>
    </div>
  );
}

export default Register;