import React from 'react';

function Mission3_Complete({ score, badge = 'Master Algoritma', onContinue }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 1s ease-in',
      }}
    >
      <div
        className="complete-screen"
        style={{ textAlign: 'center', animation: 'fadeInUp 1s ease-out' }}
      >
        <h2 style={{ marginBottom: '10px' }}>Tahniah! Anda Selesai Unit Kewangan! 🎉</h2>
        <p>Sistem pengiraan yuran pelajar kini berfungsi dengan betul.</p>
        <hr style={{ width: '80%', margin: '20px auto' }} />

        <h3 style={{ margin: '15px 0' }}>Markah Misi: {score} / 100</h3>

        {/* Badge Section */}
        <div className="badges-container" style={{ margin: '20px 0' }}>
          <h4>🏅 Lencana Diperolehi:</h4>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#fff',
              background: 'linear-gradient(135deg, #FFD700, #FFC200, #FFB000)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            className="badge"
          >
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                marginRight: '8px',
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
                  'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                transform: 'rotate(25deg)',
                pointerEvents: 'none',
                animation: 'shine 2s infinite',
                zIndex: 0,
              }}
            ></span>
          </div>
        </div>

        <hr style={{ width: '80%', margin: '20px auto' }} />
        <p>Anda telah memulihkan semua sistem di Kampus Digital!</p>

        <button
          onClick={onContinue}
          className="primary-button"
          style={{
            width: '300px',
            marginTop: '20px',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Kembali ke Kampus Digital
        </button>

        {/* Inline keyframes */}
        <style>{`
          @keyframes shine {
            0% { transform: rotate(25deg) translateX(-100%); }
            50% { transform: rotate(25deg) translateX(100%); }
            100% { transform: rotate(25deg) translateX(-100%); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .badge:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }
        `}</style>
      </div>
    </div>
  );
}

export default Mission3_Complete;
