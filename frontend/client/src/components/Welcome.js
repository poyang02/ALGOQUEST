import React from 'react';
import { playHoverSound } from '../audioUtils'; // 1. Import the universal hover function

function Welcome({ user, onContinue }) {
  
  const userName = user ? user.name : 'Wira AlgoQuest';

  return (
    // 1. Swapped the order: Image is now first (on the left)
    <div className="content-screen">
      
      {/* Robot Image (now on the left) */}
      <div className="content-image">
        <img src="/robot.png" alt="Robot Algo" />
      </div>

      {/* Text Content (now on the right) */}
      <div className="content-text">
        
        {/* 2. Added the new "welcome-highlight" block at the top */}
        <div className="welcome-highlight super-bold-large"> 
          <p>👉 Selamat datang ke AlgoQuest, <strong>{userName}</strong>!</p>
          {/* 3. Apply the override class */}
          <p className="normal-welcome-text">Mulakan pengembaraan interaktif untuk menguji dan mengasah Kemahiran Algoritma anda di Kampus Digital AlgoQuest!</p>
        </div>

        <hr style={{borderColor: '#555'}} />

        {/* 4. Robot's introduction is now at the bottom */}
        <div className="white-text">
          <h2>👋 Hai! Saya <span style={{color: '#79f8f8'}}>Robot Algo</span>, pembantu digital kampus ini.</h2>
          <p>Bersiap sedia melaksanakan misi simulasi tugasan sebenar di kampus.</p>
          <p>💡 Setiap misi akan menguji kemahiran DAAD anda!</p>
          <p>Ikuti saya untuk menyelesaikan misi DAAD dan capai lencana tertinggi!</p>
        </div>
        
        {/* 5. Apply onMouseEnter handler */}
        <button onClick={onContinue} onMouseEnter={playHoverSound} className="primary-button">Seterusnya</button>
      </div>
      
    </div>
  );
}

export default Welcome;