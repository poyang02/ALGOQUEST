import React from 'react';

function MissionLayout({ children, robotText, isCorrect }) {

  // ⭐ Dynamic glow style (static part)
  const glowColor =
    isCorrect === true
      ? 'rgba(46, 204, 113, 0.9)' // Green
      : isCorrect === false
      ? 'rgba(231, 76, 60, 0.9)' // Red
      : 'transparent';

  return (
    <div className="mission-layout">

      <div className="robot-sidebar">

        {/* ⭐ Robot Glow with pulse animation */}
        <img
          src="/robot.png"
          alt="Robot Algo"
          className={`robot-img ${isCorrect === true ? 'glow-green' : ''} ${isCorrect === false ? 'glow-red' : ''}`}
        />

        <div className="robot-chat-bubble">
          <p>{robotText}</p>
        </div>

      </div>

      <div className="mission-content">
        {children}
      </div>

      {/* ⭐ CSS injected directly for convenience */}
      <style>{`
        .robot-img {
          width: 200px;
          transition: filter 0.2s ease;
        }

        /* GREEN GLOW */
        .glow-green {
          animation: pulse-green 2.5s ease-out forwards;
        }

        /* RED GLOW */
        .glow-red {
          animation: pulse-red 2.5s ease-out forwards;
        }

        /* ⭐ Pulse + fade animations */
        @keyframes pulse-green {
          0% {
            filter: drop-shadow(0 0 0px rgba(46, 204, 113, 0));
          }
          40% {
            filter: drop-shadow(0 0 40px rgba(46, 204, 113, 1));
          }
          100% {
            filter: drop-shadow(0 0 0px rgba(46, 204, 113, 0));
          }
        }

        @keyframes pulse-red {
          0% {
            filter: drop-shadow(0 0 0px rgba(231, 76, 60, 0));
          }
          40% {
            filter: drop-shadow(0 0 40px rgba(231, 76, 60, 1));
          }
          100% {
            filter: drop-shadow(0 0 0px rgba(231, 76, 60, 0));
          }
        }
      `}</style>
    </div>
  );
}

export default MissionLayout;
