import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// NOTE: These components must exist in your project structure for this code to run
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import SettingsMenu from './components/SettingsMenu'; 
import RobotMessage from './components/RobotMessage'; 

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [robotMessage, setRobotMessage] = useState("Sila log masuk atau daftar untuk memulihkan CodeCity."); 
    
    // 🌟 NEW: State for global audio control
    const [isMuted, setIsMuted] = useState(true);
    
    // 🌟 NEW: Function to toggle mute state
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    useEffect(() => {
        if (location.pathname === '/login' || location.pathname === '/register') {
            setRobotMessage("Sila log masuk atau daftar untuk memulihkan CodeCity.");
        }

        const fetchUser = async () => {
            if (token) {
                try {
                    // NOTE: This uses local server mock API, replace with real auth if necessary
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
        // Sends user to the /game route with state {screen: 'hub'}
        navigate('/game', { state: { screen: 'hub' }, replace: true }); 
    }

    // 1. FINAL BACKGROUND LOGIC
    const getBackgroundStyle = () => {
        const gameState = location.state?.screen;

        // Auth screens (Login/Register)
        if (location.pathname === '/login' || location.pathname === '/register') {
            return {
                backgroundImage: `url('/background5.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
            };
        }

        // Welcome / HowToPlay / Hub
        if (token && (gameState === 'welcome' || gameState === 'howToPlay' || gameState === 'hub')) {
            return {
                backgroundImage: `url('/background6.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
            };
        }

        // Missions (all Mission1,2,3 pages)
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

    // 2. Final Header Class Logic (Includes fix for Mission pages)
    const getHeaderClass = () => {
        const gameState = location.state?.screen;
        const isGamePath = location.pathname === '/game'; // Check if we are on the game route

        // Remove dark overlay AND center content for Auth/Welcome/HowToPlay/Hub
        if (
            isAuthScreen ||
            (token && (gameState === 'welcome' || gameState === 'howToPlay' || gameState === 'hub'))
        ) {
            return 'no-overlay-auth center-content';
        }

        // Remove dark overlay ONLY for Mission Screens (Fix requested by user)
        if (token && isGamePath) {
            return 'no-overlay'; 
        }

        return ''; // Default behavior (which applies the dark overlay only to game screens without a state)
    };

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

            {/* 🌟 NEW: GLOBAL AUDIO PLAYER 🌟 */}
            <audio id="background-music" autoPlay loop muted={isMuted}>
                {/* Ensure bgsound.mp3 is in your public folder */}
                <source src="/bgsound.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

            {/* 3. Settings Modal */}
            {showSettings && token && (
                <SettingsMenu 
                    onClose={() => setShowSettings(false)}
                    onLogout={handleLogout}
                    onReturnToHub={handleReturnToHub}
                    isMuted={isMuted}            // 🌟 NEW: Pass Mute State
                    onToggleMute={toggleMute}    // 🌟 NEW: Pass Toggle Function
                />
            )}

            <header className={`App-header ${getHeaderClass()}`}>

                {/* 4. Settings Icon (Top Left) */}
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
                    {token ? (
                        <>
                            {/* 5. Game Route is the primary route, passes user and handlers */}
                            <Route path="/game" element={<Game user={user} onLogout={handleLogout} />} />
                            {/* 6. Hub Route is a static alias for Game when state is hub */}
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
                            <Route path="*" element={<Navigate to="/login" />} />
                        </>
                    )}
                </Routes>
            </header>
        </div>
    );
}

export default App;