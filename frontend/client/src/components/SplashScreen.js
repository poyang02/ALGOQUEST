import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    "Menghubungkan ke pangkalan data...",
    "Memuatkan profil pemain...",
    "Sediakan modul latihan...",
    "Menjana dunia Kampus Digital..."
  ];

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Handle fade-out then notify parent
  const triggerFinish = () => {
    setFadeOut(true);
    setTimeout(() => onFinish && onFinish(), 800);
  };

  // Auto fade-out after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => triggerFinish(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        ...containerStyle,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease-out"
      }}
      onClick={triggerFinish} // Tap anywhere to continue
    >
      <div style={particleContainerStyle}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <div style={contentStyle}>
        <img
          src="/algoquestlogo.png"
          alt="AlgoQuest Logo"
          style={logoImageStyle}
        />

        <p style={subtitleStyle}>Kampus Digital Menanti Anda</p>

        <div style={spinnerStyle}></div>

        <p style={loadingTextStyle}>{loadingMessages[messageIndex]}</p>
      </div>

      <p style={versionStyle}>Versi 1.0.0</p>

      {/* --- INTERNAL CSS --- */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }

          @keyframes shine {
            0% { filter: drop-shadow(0 0 5px #f1c40f); }
            50% { filter: drop-shadow(0 0 15px #ffe066); }
            100% { filter: drop-shadow(0 0 5px #f1c40f); }
          }

          @keyframes bgMove {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }

          @keyframes floatUp {
            from { transform: translateY(0); opacity: 0.6; }
            to { transform: translateY(-40px); opacity: 0; }
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            animation: floatUp 4s infinite ease-in-out;
          }

          .particle:nth-child(odd) {
            animation-duration: 5s;
          }
        `}
      </style>
    </div>
  );
};

// ---------------------
// STYLES
// ---------------------

const containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #1a1a2e, #16213e, #1e2746)",
  backgroundSize: "200% 200%",
  animation: "bgMove 6s ease-in-out infinite alternate",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  overflow: "hidden",
  color: "white"
};

const particleContainerStyle = {
  position: "absolute",
  width: "100%",
  height: "100%"
};

const contentStyle = {
  textAlign: "center",
  animation: "fadeIn 1.2s ease-out"
};

const logoImageStyle = {
  width: "340px",
  height: "auto",
  marginBottom: "20px",
  animation: "pulse 2s infinite ease-in-out, shine 3s infinite ease-in-out"
};

const subtitleStyle = {
  fontSize: "1.1rem",
  opacity: 0.85,
  marginBottom: "25px"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255, 255, 255, 0.2)",
  borderTop: "4px solid #f1c40f",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite"
};

const loadingTextStyle = {
  marginTop: "15px",
  fontSize: "0.9rem",
  letterSpacing: "2px",
  textTransform: "uppercase",
  opacity: 0.7
};

const versionStyle = {
  position: "absolute",
  bottom: 20,
  right: 20,
  opacity: 0.4,
  fontSize: "0.8rem"
};

export default SplashScreen;
