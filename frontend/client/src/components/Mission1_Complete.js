import React from 'react';

function Mission1_Complete({ score, badges, onContinue }) {
  // 1. Ensure badges is always an array
  const displayBadges = Array.isArray(badges) ? badges : [];

  // 2. Fix: Use the score directly (it's already a number)
  const finalScore = score || 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 1s ease-in'
      }}
    >
      <div className="complete-screen" style={{ textAlign: 'center', animation: 'fadeInUp 1s ease-out' }}>
        <h2>Tahniah! Anda Selesai Unit Akademik! 🎉</h2>
        <p>Sistem pendaftaran pelajar kini berfungsi dengan betul.</p>
        <hr style={{ width: '80%' }} />
        
        {/* Display the score directly */}
        <h3>Markah Misi: {finalScore} / 100</h3>

        {displayBadges.length > 0 && (
          <div className="badges-container" style={{ margin: '15px 0' }}>
            <h4>🏅 Lencana Diperolehi:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {displayBadges.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 16px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #FFD700, #FFC200, #FFB000)',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    textAlign: 'center',
                    cursor: 'default',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  className="badge"
                >
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', marginRight: '8px' }}>⭐</span>
                  <span>{badge}</span>
                  {/* Shine Animation */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                      transform: 'rotate(25deg)',
                      pointerEvents: 'none',
                      animation: 'shine 2s infinite',
                      zIndex: 0
                    }}
                  ></span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr style={{ width: '80%' }} />
        <button
          onClick={onContinue}
          className="primary-button"
          style={{
            width: '300px',
            marginTop: '20px',
            transition: 'transform 0.2s ease, background-color 0.2s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Kembali ke Kampus Digital
        </button>

        <style>{`
          @keyframes shine {
            0% { transform: rotate(25deg) translateX(-100%); }
            50% { transform: rotate(25deg) translateX(100%); }
            100% { transform: rotate(25deg) translateX(-100%); }
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .badge:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
        `}</style>
      </div>
    </div>
  );
}

export default Mission1_Complete;