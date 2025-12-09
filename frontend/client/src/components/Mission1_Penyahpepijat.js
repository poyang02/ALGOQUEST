import React, { useState } from 'react';

function Mission1_Penyahpepijat({ onContinue, onFeedback, onBadgeEarned }) {
  const initialAnswers = {
    step1: '', step2: '', step3: '', step4: '', step5: '',
  };

  const [answers, setAnswers] = useState(initialAnswers);
  const [showNextButton, setShowNextButton] = useState(false);

  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0); // Track attempts locally
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
    setShowNextButton(false); 
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setShowNextButton(false);
    setAttempts(0); // Reset attempts for full marks
    onFeedback('🔄 Reset berjaya. Markah kembali penuh.', 2000, null);
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
          phase: 'penyahpepijat',
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
    const isCorrect =
      answers.step1 === '1' &&
      answers.step2 === '2' &&
      answers.step3 === '4' &&
      answers.step4 === '3' &&
      answers.step5 === '5';

    if (!isCorrect) {
        setAttempts(prev => prev + 1);
        onFeedback(`❌ Masih ada ralat. (-5 Markah)`, 3000, false);
        setShowNextButton(false);
        return;
    }

    // Correct: Calculate Score (Start 25, minus 5 per retry, min 5)
    const calculatedScore = Math.max(5, 25 - (attempts * 5));
    const badgeEarned = attempts === 0 ? 'Master Pemulih Logik' : null;

    setEarnedScore(calculatedScore);
    setIsSubmitting(true);

    await submitPhase(calculatedScore, badgeEarned);

    let badgeMsg = badgeEarned ? ' 🏅 Lencana Master Pemulih Logik diperolehi!' : '';
onFeedback(`✅ Hebat! Urutan betul.${badgeMsg}`, 3000, true);
    setShowNextButton(true);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (showNextButton) {
        const badge = attempts === 0 ? 'Master Pemulih Logik' : null;

        // ✅ Notify Hub immediately about the earned badge
        if (badge && typeof onBadgeEarned === 'function') {
            onBadgeEarned('mission1', badge);
        }

        onContinue(earnedScore, badge);
    }
};


  return (
    <div>
      <h3>TAHAP 4: PENYAHPEPIJATAN</h3>
      <p>Sistem Akademik mencetak slip pendaftaran sebelum pelajar mendaftar kursus. Susun semula langkah pseudokod di bawah dengan memberi nombor urutan yang betul (1–5) supaya sistem berfungsi dengan tepat.
</p>
      <hr />

      <div className="debug-container">
        <div className="pseudocode-box">
          <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>
            PSEUDOKOD (ralat disorot)
          </h4>
          <p>[1] MULA</p>
          <p>[2] Masukkan Nama Pelajar, No Pendaftaran, Program, Semester, Kursus</p>
          <p>[3] Cetak Slip Pendaftaran</p>
          <p>[4] Daftar Kursus</p>
          <p>[5] TAMAT</p>
          <hr />
          <p><strong>Masalah:</strong> Sistem mencetak slip sebelum pelajar mendaftar kursus.</p>
          <p><strong>Output salah:</strong> Slip kosong tanpa maklumat kursus.</p>
        </div>

        <div className="debug-answer-box">
          <h4 className="debug-title">SUSUNAN BETUL</h4>
          <p className="debug-title">Tulis nombor urutan yang betul (1-5) di dalam kotak.</p>
          {['step1','step2','step3','step4','step5'].map((step) => (
            <div key={step} style={{ margin: '10px 0' }}>
              <input
                type="text"
                name={step}
                value={answers[step]}
                onChange={handleInputChange}
                className="order-input"
              />
              <label>
                {step === 'step1' && ' MULA'}
                {step === 'step2' && ' Masukkan Nama Pelajar, No Pendaftaran...'}
                {step === 'step3' && ' Cetak Slip Pendaftaran'}
                {step === 'step4' && ' Daftar Kursus'}
                {step === 'step5' && ' TAMAT'}
              </label>
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
            backgroundColor: showNextButton ? '#2ecc71' : '#999',
            cursor: showNextButton ? 'pointer' : 'not-allowed',
          }}
          disabled={!showNextButton}
          onClick={handleNext}
        >
          Hantar
        </button>
      </div>
    </div>
  );
}

export default Mission1_Penyahpepijat;
