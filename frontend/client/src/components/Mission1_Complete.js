import React from 'react';

function Mission1_Complete({ score, badges, onContinue }) {
  return (
    // Outer wrapper: full width + flex center
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center', // center horizontally
        alignItems: 'center',     // center vertically (remove if you don't want vertical centering)
      }}
    >
      <div className="complete-screen">
        <h2>Tahniah! Anda Selesai Unit Akademik! 🎉</h2>
        <p>Sistem pendaftaran pelajar kini berfungsi dengan betul.</p>
        <hr style={{ width: '80%' }} />

        <h3>Markah Misi: {score} / 100</h3>

        {badges.length > 0 && (
          <div className="badges-container" style={{ margin: '15px 0' }}>
            <h4>🏅 Lencana Diperolehi:</h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '10px',
                justifyContent: 'center', // center badges row as well
              }}
            >
              {badges.map((badge, idx) => (
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
                    background:
                      'linear-gradient(135deg, #FFD700, #FFC200, #FFB000)',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      marginRight: '8px',
                      fontSize: '1rem',
                      lineHeight: '16px',
                    }}
                  >
                    ⭐
                  </span>

                  <span style={{ zIndex: 1 }}>{badge}</span>

                  <span
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background:
                        'linear-gradient(120deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%)',
                      transform: 'rotate(25deg)',
                      pointerEvents: 'none',
                      animation: 'shine 2s infinite',
                      zIndex: 0,
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
          style={{ width: '300px' }}
        >
          Kembali ke Kampus Digital
        </button>

        {/* Inline keyframes for shine animation */}
        <style>{`
          @keyframes shine {
            0% { transform: rotate(25deg) translateX(-100%); }
            50% { transform: rotate(25deg) translateX(100%); }
            100% { transform: rotate(25deg) translateX(-100%); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Mission1_Complete;
