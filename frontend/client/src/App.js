import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// NOTE: These components must exist in your project structure for this code to run
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import SettingsMenu from './components/SettingsMenu';
import RobotMessage from './components/RobotMessage';
import SplashScreen from './components/SplashScreen'; // 🌟 NEW IMPORT
import useDeviceType from './hooks/useDeviceType';
import MissionLayout from './components/MissionLayout';
import Mission2_Penyahpepijat from './components/Mission2_Penyahpepijat';

function AppLayout({ children }) {
  const { isMobile } = useDeviceType();

  return (
    <div className={isMobile ? 'mobile-view' : 'desktop-view'}>
      {children}
    </div>
  );
}


function Mission2PenyahpepijatPreview() {
  const [feedbackText, setFeedbackText] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const handleFeedback = (message, duration = 3000, correctState = null) => {
    setFeedbackText(message);
    setIsCorrect(correctState);
    setTimeout(() => {
      setFeedbackText('');
      setIsCorrect(null);
    }, duration);
  };

  const robotText = feedbackText || "Sistem peperiksaan mengalami ralat! Semak pseudokod dan output, kenal pasti ralat logik dan pilih pembetulan yang paling tepat.";

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0a0d14', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <header className="App-header no-overlay" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: '20px 0 10px' }}>ALGOQUEST PREVIEW</h1>
        <hr style={{ width: '90%', borderColor: '#79f8f8', marginBottom: '20px' }} />
        <MissionLayout robotText={robotText} isCorrect={isCorrect}>
          <Mission2_Penyahpepijat 
            onContinue={(score, badge) => {
              alert(`Phase Complete!\nScore Earned: ${score}\nBadge: ${badge || 'None'}`);
            }}
            onFeedback={handleFeedback}
          />
        </MissionLayout>
      </header>
    </div>
  );
}

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [robotMessage, setRobotMessage] = useState("Sila log masuk atau daftar untuk memulihkan Kampus Digital.");

    // 🌟 NEW: Splash Screen State
    const [showSplash, setShowSplash] = useState(true);

    // 🌟 NEW: Global audio mute state
    const [isMuted, setIsMuted] = useState(true);

    // 🌟 NEW: Toggle mute handler
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    useEffect(() => {
        // REMOVE old splash timeout
        // Now completely controlled by the SplashScreen itself

        if (location.pathname === '/login' || location.pathname === '/register') {
            setRobotMessage("Sila log masuk atau daftar untuk memulihkan Kampus Digital.");
        }

        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await fetch('https://algoquest-api.onrender.com/api/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data);
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (err) {
                    console.error("Failed to fetch user", err);
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, [token, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login', { replace: true });
    };

    const handleReturnToHub = () => {
        setShowSettings(false);
        navigate('/game', { state: { screen: 'hub' }, replace: true });
    };

    // 1. FINAL BACKGROUND LOGIC
    const getBackgroundStyle = () => {
        const gameState = location.state?.screen;

        if (location.pathname === '/login' || location.pathname === '/register') {
            return {
                backgroundImage: `url('/background5.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
            };
        }

        if (token && (gameState === 'welcome' || gameState === 'howToPlay' || gameState === 'hub')) {
            return {
                backgroundImage: `url('/background6.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
            };
        }

        if (token && location.pathname === '/game') {
            return {
                backgroundImage: `url('/background7.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
            };
        }

        return {};
    };

    const isAuthScreen = location.pathname === '/login' || location.pathname === '/register';

    // 2. HEADER CLASS LOGIC
    const getHeaderClass = () => {
        const gameState = location.state?.screen;
        const isGamePath = location.pathname === '/game';

        if (
            isAuthScreen ||
            (token && (gameState === 'welcome' || gameState === 'howToPlay' || gameState === 'hub'))
        ) {
            return 'no-overlay-auth center-content';
        }

        if (token && isGamePath) {
            return 'no-overlay';
        }

        return '';
    };

    // 🌟 NEW: Splash Screen Rendering
    if (showSplash) {
        return (
            <SplashScreen
                onFinish={() => setShowSplash(false)}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="App">
                <header className="App-header"><h1>Loading...</h1></header>
            </div>
        );
    }

    const headerContent = token ? (
        <>
            <h1>ALGOQUEST</h1>
            <hr style={{ width: '90%', borderColor: '#79f8f8' }} />
        </>
    ) : (
        <img src="/algoquestlogo.png" alt="ALGOQUEST Logo" className="auth-logo" />
    );

    return (
        <div className="App" style={getBackgroundStyle()}>

            {/* 🌟 GLOBAL AUDIO PLAYER */}
            <audio id="background-music" autoPlay loop muted={isMuted}>
                <source src="/bgsound.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

            {/* SETTINGS MODAL */}
            {showSettings && token && (
                <SettingsMenu
                    onClose={() => setShowSettings(false)}
                    onLogout={handleLogout}
                    onReturnToHub={handleReturnToHub}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                />
            )}

            <header className={`App-header ${getHeaderClass()}`}>

                {token && (
                    <div
                        className="settings-icon"
                        onClick={() => setShowSettings(true)}
                        title="Settings"
                    >
                        <img src="/settings.png" alt="Settings" />
                    </div>
                )}

                {headerContent}

                {isAuthScreen && (
                    <>
                        <img
                            src="/robot.png"
                            alt="Robot Algo Helper"
                            className="auth-robot-image"
                        />
                    </>
                )}

                <Routes>
                    <Route path="/preview" element={<Mission2PenyahpepijatPreview />} />
                    {token ? (
                        <>
                            <Route path="/game" element={<Game user={user} onLogout={handleLogout} />} />
                            <Route path="/hub" element={<Navigate to="/game" state={{ screen: 'hub' }} replace />} />
                            <Route path="*" element={<Navigate to="/game" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/login" element={
                                <div className="auth-container" style={{ flexGrow: 1, alignItems: 'center' }}>
                                    <Login />
                                </div>
                            } />
                            <Route path="/register" element={
                                <div className="auth-container" style={{ flexGrow: 1, alignItems: 'center' }}>
                                    <Register />
                                </div>
                            } />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </>
                    )}
                </Routes>
            </header>
        </div>
    );
}

export default App;
