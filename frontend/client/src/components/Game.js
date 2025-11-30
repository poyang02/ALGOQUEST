import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Welcome from './Welcome';
import HowToPlay from './HowToPlay';
import Hub from './Hub';
import Mission1 from './Mission1';
import Mission2 from './Mission2';
import Mission3 from './Mission3';

function Game({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  // 1. Initialize state from URL history (for persistence across refreshes)
  const [gameState, setGameState] = React.useState(location.state?.screen || 'welcome'); 

  // 2. Update the URL state every time the gameState changes (for dynamic background switching)
  useEffect(() => {
    // Only update if the screen state has actually changed
    if (location.state?.screen !== gameState) {
      navigate(location.pathname, { replace: true, state: { screen: gameState } });
    }
  }, [gameState, navigate, location.pathname, location.state]);

  const handleSetGameState = (newState) => {
    setGameState(newState);
  };

  // 3. Central function to send score to the backend
  const handleMissionComplete = async (missionId, score) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://algoquest-api.onrender.com/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ missionId, score })
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
    // Always return to the hub after completion
    setGameState('hub');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'welcome':
        return <Welcome user={user} onContinue={() => handleSetGameState('howToPlay')} />;
      case 'howToPlay':
        return <HowToPlay onContinue={() => handleSetGameState('hub')} />;
      case 'hub':
        return (
          <Hub
            onLogout={onLogout} // Pass logout for Tamat Permainan button
            onStartMission1={() => handleSetGameState('mission1')}
            onStartMission2={() => handleSetGameState('mission2')}
            onStartMission3={() => handleSetGameState('mission3')}
          />
        );
      case 'mission1':
        return <Mission1 onMissionComplete={(score) => handleMissionComplete('mission1', score)} />;
      case 'mission2':
        return <Mission2 onMissionComplete={(score) => handleMissionComplete('mission2', score)} />;
      case 'mission3':
        return <Mission3 onMissionComplete={(score) => handleMissionComplete('mission3', score)} />;
      default:
        return <div>Loading...</div>;
    }
  };

  // 4. Wrap the rendered component in the game container
  return (
    <div className="game-container">
      {renderGameState()}
    </div>
  );
}

export default Game;