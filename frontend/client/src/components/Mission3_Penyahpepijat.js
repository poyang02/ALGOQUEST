import React, { useState, useEffect } from 'react';

function Mission3_Penyahpepijat({ onContinue, onFeedback, onBadgeEarned, setRobotText }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const correctAnswer = 'D';

  // Backend Integration State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial robot text when component loads
  useEffect(() => {
    if (setRobotText) {
      setRobotText(
        'Sistem Kewangan mengesan keputusan yang salah walaupun bayaran telah dibuat penuh. Bantu saya kenal pasti bahagian pseudokod yang menyebabkan status ‘Belum Lunas’ dipaparkan walaupun jumlah bayaran mencukupi!'
      );
    }
  }, [setRobotText]);

  const checkAnswer = async () => {
    if (!selectedAnswer) {
       if (onFeedback) onFeedback('❌ Sila pilih satu jawapan dahulu.', 3000, false);
       return;
    }

    const ok = selectedAnswer === correctAnswer;

    if (!ok) {
      setAttempts(prev => prev + 1);
      setIsCorrect(false);
      if (onFeedback) {
        onFeedback('❌ Salah. Semak semula logik perbandingan dalam pseudokod. (-5 Markah)', 3000, false);
      }
      return;
    }

    // Correct: Calculate Score
    const calculatedScore = Math.max(5, 25 - (attempts * 5));

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // Call Backend API
      const response = await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          mission: 3,
          phase: 'penyahpepijat',
          isCorrect: true,
          score: calculatedScore,
          // Badge awarded if correct on first try
          badge: attempts === 0 ? 'Master Pemulih Logik' : null
        })
      });

      const data = await response.json();
      setEarnedScore(calculatedScore);
      setIsCorrect(true);

      let badgeMsg = '';
      if (attempts === 0) {
           badgeMsg = '\n\n🏅 Anda telah memperoleh lencana "Master Pemulih Logik".';
           if (onBadgeEarned) onBadgeEarned('Master Pemulih Logik');
      }

      if (onFeedback) {
        onFeedback(
          `✅ Betul! Simbol perbandingan mesti menggunakan ≥ supaya pelajar yang membayar penuh dikira sebagai Lunas. (+${calculatedScore} Markah)${badgeMsg}`,
          3000,
          true
        );
      }

    } catch (err) {
      console.error("Error submitting:", err);
      if (onFeedback) onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsCorrect(false);
    setAttempts(0);
    if (onFeedback) onFeedback('🔄 Struktur telah direset. Cuba semula.', 2000, null);
  };

  const handleNext = () => {
    if (!isCorrect) return;
    const badge = attempts === 0 ? 'Master Pemulih Logik' : null;
    onContinue && onContinue(earnedScore, badge);
  };

  return (
    <div>
      <h3>TAHAP 4: PENYAHPEPIJAT</h3>
      <p> 
        Sistem kewangan gagal mengira baki yuran dengan tepat. Dikesan bahawa pelajar yang telah membuat bayaran penuh masih dipaparkan sebagai “Belum Lunas”.  Bantu Sistem Kewangan membetulkan pseudokod supaya baki dan status bayaran dapat dijana dengan betul.
      </p>
      <hr />

      <div className="quiz-container" style={{ display: 'flex', gap: '20px' }}>
        {/* Pseudokod */}
        <div className="pseudocode-box" style={{ width: '48%' }}>
          <h4 style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
            PSEUDOKOD
          </h4>
          <p>MULA</p>
          <p>Masukkan No Pendaftaran</p>
          <p>Masukkan Jumlah Yuran</p>
          <p>Masukkan Jumlah Bayaran</p>
          <p>Jika Jumlah Bayaran {'>'} Jumlah Yuran</p>
          <p>&nbsp;&nbsp;Status = "Lunas"</p>
          <p>Jika tidak</p>
          <p>&nbsp;&nbsp;Status = "Belum Lunas"</p>
          <p>Kira Baki = Jumlah Yuran - Jumlah Bayaran</p>
          <p>Papar Status dan Baki</p>
          <p>TAMAT</p>
        </div>

        {/* Maklumat Output Table */}
        <div className="quiz-answers" style={{ width: '48%' }}>
          <h4 style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
            MAKLUMAT OUTPUT
          </h4>
          <table className="output-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #79f8f8', padding: '5px' }}>Input</th>
                <th style={{ border: '1px solid #79f8f8', padding: '5px' }}>Output Sistem</th>
                <th style={{ border: '1px solid #79f8f8', padding: '5px' }}>Sepatutnya</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Jumlah Yuran = 1000, Jumlah Bayaran = 1000</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Belum Lunas ❌</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Lunas ✅</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Jumlah Yuran = 1500, Jumlah Bayaran = 1000</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Belum Lunas ✅</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Belum Lunas ✅</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Jumlah Yuran = 1200, Jumlah Bayaran = 1300</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Belum Lunas ❌</td>
                <td style={{ border: '1px solid #79f8f8', padding: '5px' }}>Status = Lunas ✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr />
      <h4>Apakah punca utama kesilapan logik berdasarkan pseudokod di atas?</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          className={`choice-button ${selectedAnswer === 'A' ? 'selected' : ''}`}
          onClick={() => { setSelectedAnswer('A'); setIsCorrect(false); }}
        >
          A. Formula baki tidak dikira dengan betul.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'B' ? 'selected' : ''}`}
          onClick={() => { setSelectedAnswer('B'); setIsCorrect(false); }}
        >
          B. Paparan output dilakukan sebelum proses penentuan status.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'C' ? 'selected' : ''}`}
          onClick={() => { setSelectedAnswer('C'); setIsCorrect(false); }}
        >
          C. Arahan “Cetak Status” sepatutnya diletakkan sebelum “Jika tidak”.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'D' ? 'selected' : ''}`}
          onClick={() => { setSelectedAnswer('D'); setIsCorrect(false); }}
        >
          D. Syarat logik tidak tepat — perlu guna “≥” untuk status lunas.
        </button>
      </div>

      <hr />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={handleReset} className="primary-button" disabled={isSubmitting}>
          Buat Semula
        </button>

        <button onClick={checkAnswer} className="primary-button" disabled={isSubmitting}>
          Semak Jawapan
        </button>

        <button
          onClick={isCorrect ? handleNext : undefined}
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed',
          }}
          disabled={!isCorrect}
        >
          Hantar
        </button>
      </div>

    </div>
  );
}

export default Mission3_Penyahpepijat;