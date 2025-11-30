import React, { useState } from 'react';

function Mission1_Penyahpepijat({ onContinue, onFeedback }) {
  const initialAnswers = {
    step1: '', step2: '', step3: '', step4: '', step5: '',
  };

  const [answers, setAnswers] = useState(initialAnswers);
  const [showNextButton, setShowNextButton] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
    setShowNextButton(false); // hide Seterusnya if user changes input
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setShowNextButton(false);
    onFeedback(''); // clear robot feedback
  };

  const checkAnswer = () => {
    const isCorrect =
      answers.step1 === '1' &&
      answers.step2 === '2' &&
      answers.step3 === '4' &&
      answers.step4 === '3' &&
      answers.step5 === '5';

    if (isCorrect) {
      onFeedback('✅ Hebat! Kamu berjaya membetulkan urutan langkah sistem. Slip kini mengandungi maklumat kursus dengan betul!', 3000, true);
      setShowNextButton(true); // enable Seterusnya
    } else {
      onFeedback('❌ Masih ada ralat. Pastikan pelajar daftar kursus dahulu sebelum cetak slip.', 3000, false);
      setShowNextButton(false);
    }
  };

  return (
    <div>
      <h3>TAHAP 4: PENYAHPEPIJAT</h3>
      <p>Sistem Akademik mencetak slip pendaftaran sebelum pelajar mendaftar kursus. Susun semula langkah pseudokod di bawah <br></br>dengan memberi nombor urutan yang betul (1–5) supaya sistem berfungsi dengan tepat.
</p>
      <hr />

      <div className="debug-container">
        <div className="pseudocode-box">
          <h4>PSEUDOKOD (ralat disorot)</h4>
          <p>[1] MULA</p>
          <p>[2] Masukkan Nama Pelajar, No Pendaftaran, Program, Semester, Kursus</p>
          <p className="error">[3] Cetak Slip Pendaftaran ⚠️</p>
          <p className="error">[4] Daftar Kursus ⚠️</p>
          <p>[5] TAMAT</p>
          <hr />
          <p><strong>Masalah:</strong> Sistem mencetak slip sebelum pelajar mendaftar kursus.</p>
          <p><strong>Output salah:</strong> Slip kosong tanpa maklumat kursus.</p>
        </div>

        <div className="debug-answer-box">
          <h4>SUSUNAN BETUL</h4>
          <p>Tulis nombor urutan yang betul (1-5) di dalam kotak.</p>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={reset}
          className="primary-button"
          style={{ width: 'auto', marginRight: '10px'}}
        >
          Buat Semula
        </button>
        <button
          onClick={checkAnswer}
          className="primary-button"
          style={{ width: 'auto', marginRight: '10px' }}
        >
          Semak Jawapan
        </button>
        <button
          onClick={onContinue}
          className="primary-button"
          style={{
            width: 'auto',
            backgroundColor: showNextButton ? '#2ecc71' : '#888',
            cursor: showNextButton ? 'pointer' : 'not-allowed',
          }}
          disabled={!showNextButton}
        >
          Seterusnya
        </button>
      </div>
    </div>
  );
}

export default Mission1_Penyahpepijat;
