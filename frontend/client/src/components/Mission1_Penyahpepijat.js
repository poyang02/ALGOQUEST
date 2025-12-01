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
<div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  }}
>
  <button onClick={reset} className="primary-button">
    Buat Semula
  </button>

  <button onClick={checkAnswer} className="primary-button">
    Semak Jawapan
  </button>

  <button
    className="primary-button"
    style={{
      backgroundColor: showNextButton ? '#2ecc71' : '#999',
      cursor: showNextButton ? 'pointer' : 'not-allowed',
    }}
    disabled={!showNextButton}
    onClick={showNextButton ? onContinue : undefined}
  >
    Hantar
  </button>
</div>

    </div>
  );
}

export default Mission1_Penyahpepijat;
