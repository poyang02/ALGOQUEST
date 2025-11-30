import React from 'react';

function Mission3_Complete({ score, badge = 'Master Algoritma', onContinue }) {
  return (
    <div className="complete-screen" style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Tahniah! Anda Selesai Unit Kewangan! 🎉</h2>
      <p>Sistem pengiraan yuran pelajar kini berfungsi dengan betul.</p>
      <hr style={{ width: '80%', margin: '20px auto' }} />

      <h3>Markah Misi: {score} / 100</h3>

      {/* Badge Section */}
      <div style={{ margin: '20px 0' }}>
        <p>🏅 Lencana Diperolehi:</p>
        <div style={{
          display: 'inline-block',
          padding: '10px 20px',
          borderRadius: '12px',
          backgroundColor: '#f1c40f',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {badge}
        </div>
      </div>

      <hr style={{ width: '80%', margin: '20px auto' }} />
      <p>Anda telah memulihkan semua sistem di Kampus Digital!</p>
      <button
        onClick={onContinue}
        className="primary-button"
        style={{ width: '300px', marginTop: '20px' }}
      >
        Kembali ke Kampus Digital
      </button>
    </div>
  );
}

export default Mission3_Complete;
