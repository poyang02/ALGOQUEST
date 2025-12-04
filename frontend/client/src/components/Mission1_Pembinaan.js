import React, { useState } from 'react';

const initialAvailableSteps = [
  { id: 's1', content: 'Cetak Slip Pendaftaran' },
  { id: 's2', content: 'Masukkan Nama Pelajar, No Pendaftaran,\n Program, Semester, Kursus' },
  { id: 's3', content: 'Daftar kursus' },
  { id: 's4', content: 'Tamat' },
  { id: 's5', content: 'Mula' },
];

function Mission1_Pembinaan({ onContinue, onFeedback }) {
  const [availableSteps, setAvailableSteps] = useState(initialAvailableSteps);
  const [orderedSteps, setOrderedSteps] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0); // Track attempts locally
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moveStep = (stepToMove) => {
    setAvailableSteps(prev => prev.filter(step => step.id !== stepToMove.id));
    setOrderedSteps(prev => [...prev, stepToMove]);
    setIsCorrect(false);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setOrderedSteps(prev => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
    setIsCorrect(false);
  };

  const moveDown = (index) => {
    if (index === orderedSteps.length - 1) return;
    setOrderedSteps(prev => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
    setIsCorrect(false);
  };

  // --------------------------
  // Updated: checkAnswer & submitPhase
  // --------------------------
  const submitPhase = async (score, badge = null) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mission: 1,
          phase: 'pembinaan',
          isCorrect: true,
          score: score,
          badge: badge
        })
      });
    } catch (err) {
      console.error("Mission submit failed:", err);
      onFeedback('⚠️ Ralat menghantar markah ke pelayan.', 3000, false);
    }
  };

  const checkAnswer = async () => {
    const correctOrder = ['s5', 's2', 's3', 's1', 's4'];
    const playerOrder = orderedSteps.map(step => step.id);
    const ok = JSON.stringify(playerOrder) === JSON.stringify(correctOrder);

    if (!ok) {
        setAttempts(prev => prev + 1);
        setIsCorrect(false);
        onFeedback('❌ 😅 Masih ada langkah yang tersilap! (-5 Markah)', 3000, false);
        return;
    }

    const calculatedScore = Math.max(5, 25 - (attempts * 5));
    const badgeEarned = attempts === 0 ? 'Master Algoritma' : null;

    setEarnedScore(calculatedScore);
    setIsCorrect(true);

    await submitPhase(calculatedScore, badgeEarned);

    let msg = `✅ 🎉 Hebat! Algoritma kamu betul! (+${calculatedScore} Markah)`;
    if (badgeEarned) msg += ' 🏅 Lencana Master Algoritma diperolehi!';
    onFeedback(msg, 3000, true);
  };

  const reset = () => {
    setAvailableSteps(initialAvailableSteps);
    setOrderedSteps([]);
    setIsCorrect(false);
    setAttempts(0);
    onFeedback('🔄 Susunan algoritma telah direset. Cuba bina semula dari awal.', 2000, null);
  };

  const handleNext = () => {
    if (!isCorrect) return;
    const badge = attempts === 0 ? 'Master Algoritma' : null;
    onContinue(earnedScore, badge);
  };

  return (
    <div>
      <h3>TAHAP 3: PEMBINAAN ALGORITMA</h3>
      <p>
        Sistem Akademik memerlukan algoritma baharu bagi memastikan proses pendaftaran pelajar berjalan dengan teratur. <br />
        Tugas anda ialah menyusun langkah pendaftaran dalam urutan yang betul dalam penghasilsan pseudokod bagi sistem tersebut.
      </p>
      <hr />

      <div className="sorter-container">
        <div className="sorter-box" style={{ backgroundColor: '#282c34' }}>
          <h4>SENARAI LANGKAH</h4>
          {availableSteps.map((step) => (
            <div key={step.id} className="sorter-item">
              <span style={step.id === 's2' ? { textAlign: 'left', whiteSpace: 'pre-line', display: 'block' } : {}}>
                {step.content}
              </span>
              <button onClick={() => moveStep(step)}>➡️</button>
            </div>
          ))}
        </div>

        <div className="sorter-box" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <h4>SUSUNAN ALGORITMA</h4>
          {orderedSteps.map((step, index) => (
            <div key={step.id} className="sorter-item">
              <span style={step.id === 's2' ? { textAlign: 'left', whiteSpace: 'pre-line', display: 'block' } : {}}>
                {step.content}
              </span>
              <div>
                <button onClick={() => moveUp(index)} disabled={index === 0}>⬆️</button>
                <button onClick={() => moveDown(index)} disabled={index === orderedSteps.length - 1}>⬇️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button onClick={reset} className="primary-button" disabled={isSubmitting}>
          Buat Semula
        </button>

        <button onClick={checkAnswer} className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Menghantar...' : 'Semak Jawapan'}
        </button>

        <button
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed',
          }}
          disabled={!isCorrect}
          onClick={handleNext}
        >
          Seterusnya
        </button>
      </div>

    </div>
  );
}

export default Mission1_Pembinaan;
