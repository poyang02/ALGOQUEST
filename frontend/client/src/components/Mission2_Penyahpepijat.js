import React, { useState, useEffect } from 'react';

function Mission2_Penyahpepijat({ onContinue, setRobotText, onBadgeEarned, onFeedback }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [statements, setStatements] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [isCorrect, setIsCorrect] = useState(false);

  // Backend Integration State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Jawapan betul
  const correctAnswer = 'B';

  // Set initial robot text when component loads
  useEffect(() => {
    if (setRobotText) {
      setRobotText(
        'Semak pseudokod dan output tersebut. Kenal pasti ralat logik dan pilih pembetulan yang paling tepat.'
      );
    }
  }, [setRobotText]);

  const handleStatementSelect = (id, value) => {
    setStatements(prev => ({
      ...prev,
      [id]: value
    }));
    setIsCorrect(false); // Reset correct state if they change a statement
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setStatements({
      1: null,
      2: null,
      3: null,
      4: null,
    });
    setIsCorrect(false);
    setAttempts(0); // Reset attempts
    if (setRobotText) {
      setRobotText(
        '🔄 Pilihan telah direset. Sila jawab semula Bahagian A dan Bahagian B.'
      );
    }
  };

  const checkAnswer = async () => {
    if (!selectedAnswer) {
      if (onFeedback) {
        onFeedback('❌ Sila pilih jawapan untuk Bahagian A dahulu sebelum menghantar.', 3000, false);
      }
      return;
    }

    const hasUnanswered = Object.values(statements).some(val => val === null);
    if (hasUnanswered) {
      if (onFeedback) {
        onFeedback('❌ Sila tentukan "Betul" atau "Salah" untuk semua pernyataan di Bahagian B.', 3000, false);
      }
      return;
    }

    const isACorrect = selectedAnswer === correctAnswer;
    const isBCorrect =
      statements[1] === 'Salah' &&
      statements[2] === 'Betul' &&
      statements[3] === 'Betul' &&
      statements[4] === 'Betul';

    const ok = isACorrect && isBCorrect;

    if (!ok) {
        setAttempts(prev => prev + 1);
        setIsCorrect(false);
        
        let msg = '';
        if (!isACorrect && !isBCorrect) {
          msg = '❌ Jawapan Bahagian A dan Bahagian B kurang tepat. Semak semula logik pseudokod asal. (-5 Markah)';
        } else if (!isACorrect) {
          msg = '❌ Jawapan Bahagian A kurang tepat. Semak semula logik syarat. (-5 Markah)';
        } else {
          msg = '❌ Jawapan Bahagian B kurang tepat. Semak semula status pelajar berdasarkan logik pseudokod asal. (-5 Markah)';
        }
        
        if (onFeedback) {
            onFeedback(msg, 3000, false);
        }
        return;
    }

    // Correct: Calculate Score
    const calculatedScore = Math.max(5, 25 - (attempts * 5));

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          mission: 2,
          phase: 'penyahpepijat',
          isCorrect: true,
          score: calculatedScore,
          // Badge awarded if correct on first try
          badge: attempts === 0 ? 'Master Pemulih Logik' : null
        })
      });

      setEarnedScore(calculatedScore);
      setIsCorrect(true);

      let badgeMsg = '';
      if (attempts === 0) {
           badgeMsg = '\n\n🏅 Anda telah memperoleh lencana "Master Pemulih Logik".';
           if (onBadgeEarned) onBadgeEarned('Master Pemulih Logik');
      }

      if (onFeedback) {
        onFeedback(
          `✅ Hebat! Anda telah membetulkan ralat logik dan menganalisis pernyataan dengan betul.${badgeMsg}`, 
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

  const handleNext = () => {
    if (!isCorrect) return;
    const badge = attempts === 0 ? 'Master Pemulih Logik' : null;
    onContinue && onContinue(earnedScore, badge);
  };

  return (
    <div>
      <h3>TAHAP 4: PENYAHPEPIJATAN</h3>

      <p>
        Sistem peperiksaan mengalami ralat dalam menentukan keputusan pelajar.
        Robot Algo mengesan bahawa walaupun pelajar mendapat markah tinggi,
        keputusan masih dipaparkan sebagai <strong>&quot;Gagal&quot;</strong>.
        Tugas anda ialah membetulkan pseudokod supaya sistem berfungsi dengan betul.
      </p>
      <hr />

      <div className="quiz-container" style={{ display: 'flex', gap: '4%', marginTop: '20px' }}>
        {/* Pseudokod (kiri) */}
        <div className="pseudocode-box" style={{ width: '48%' }}>
          <div
            className="highlight-box"
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: '1.5',
              textTransform: 'uppercase'
            }}
          >
            PSEUDOKOD
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <p>Mula</p>
            <p>Masukkan Markah PB dan Markah PA</p>
            <p>Jika PB {'>'} 50 dan PA {'<'} 50</p>
            <p>&nbsp;&nbsp;Status = &quot;Lulus&quot;</p>
            <p>Jika tidak</p>
            <p>&nbsp;&nbsp;Status = &quot;Gagal&quot;</p>
            <p>Cetak Status</p>
            <p>Tamat</p>
          </div>
        </div>

        {/* Maklumat Output (kanan) */}
        <div className="quiz-answers" style={{ width: '48%' }}>
          <div
            className="highlight-box"
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: '1.5',
              textTransform: 'uppercase'
            }}
          >
            MAKLUMAT OUTPUT
          </div>

          {/* 2-column layout inside Maklumat Output */}
          <div
            className="output-table"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '10px',
              textAlign: 'center',
            }}
          >
            {/* Column 1: Input */}
            <div>
              <p style={{ fontWeight: 'bold' }}>Input</p>
              <p>PB = 70, PA = 80</p>
              <p>PB = 70, PA = 30</p>
              <p>PB = 40, PA = 60</p>
              <p>PB = 60, PA = 60</p>
            </div>

            {/* Column 2: Output Sistem */}
            <div>
              <p style={{ fontWeight: 'bold' }}>Output Sistem</p>
              <p>Status: Gagal ❌(sepatutnya Lulus)</p>
              <p>Status: Lulus ✅</p>
              <p>Status: Gagal ✅</p>
              <p>Status: Gagal ❌(sepatutnya Lulus)</p>
            </div>
          </div>
        </div>
      </div>


      <hr />
      <h4>Bahagian A: Apakah punca utama kesilapan logik berdasarkan perbezaan output di atas?</h4>

      {/* Pilihan jawapan – gaya sama seperti sebelum ini */}
      <div>
        <button
          className={`choice-button ${selectedAnswer === 'A' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedAnswer('A');
            setIsCorrect(false);
          }}
        >
          A. Struktur if–else salah – arahan “Jika tidak” sepatutnya diletakkan sebelum pernyataan “Lulus”.
        </button>

        <button
          className={`choice-button ${selectedAnswer === 'B' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedAnswer('B');
            setIsCorrect(false);
          }}
        >
          B. Syarat logik salah – sepatutnya guna PB ≥ 50 dan PA ≥ 50 untuk menentukan Lulus.
        </button>

        <button
          className={`choice-button ${selectedAnswer === 'C' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedAnswer('C');
            setIsCorrect(false);
          }}
        >
          C. Arahan “Cetak Status” sepatutnya diletakkan sebelum “Jika tidak”.
        </button>

        <button
          className={`choice-button ${selectedAnswer === 'D' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedAnswer('D');
            setIsCorrect(false);
          }}
        >
          D. Perbandingan PA {'<'} 50 tidak memberi kesan kepada output.
        </button>
      </div>

      <hr />
      <h4>Bahagian B: Tentukan sama ada setiap pernyataan berikut adalah betul atau salah berdasarkan logik pseudokod asal.</h4>
      
      <table className="styled-table" style={{ width: '100%', marginTop: '10px' }}>
        <thead>
          <tr>
            <th style={{ width: '8%', textAlign: 'center' }}>No.</th>
            <th>Pernyataan</th>
            <th style={{ width: '30%', textAlign: 'center' }}>Betul / Salah</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 1, text: 'Pelajar dengan PB = 80 dan PA = 90 akan mendapat status “Lulus”.' },
            { id: 2, text: 'Pelajar dengan PB = 45 dan PA = 30 akan mendapat status “Gagal”.' },
            { id: 3, text: 'Pelajar dengan PB = 60 dan PA = 40 akan mendapat status “Lulus”.' },
            { id: 4, text: 'Pseudokod asal boleh menghasilkan status “Lulus” walaupun markah PA kurang daripada 50.' }
          ].map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.id}</td>
              <td>{item.text}</td>
              <td>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    className={`choice-button ${statements[item.id] === 'Betul' ? 'selected' : ''}`}
                    style={{ margin: 0, padding: '6px 12px', width: 'auto', textAlign: 'center', display: 'inline-block' }}
                    onClick={() => handleStatementSelect(item.id, 'Betul')}
                  >
                    Betul
                  </button>
                  <button
                    className={`choice-button ${statements[item.id] === 'Salah' ? 'selected' : ''}`}
                    style={{ margin: 0, padding: '6px 12px', width: 'auto', textAlign: 'center', display: 'inline-block' }}
                    onClick={() => handleStatementSelect(item.id, 'Salah')}
                  >
                    Salah
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* 3 buttons on the right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button
          onClick={handleReset}
          className="primary-button"
          disabled={isSubmitting}
        >
          Buat Semula
        </button>

        <button
          onClick={checkAnswer}
          className="primary-button"
          disabled={isSubmitting}
        >
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

export default Mission2_Penyahpepijat;