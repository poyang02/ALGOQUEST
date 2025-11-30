import React, { useState } from 'react';

function Mission3_Penyahpepijat({ onContinue, onFeedback, onBadgeEarned }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const correctAnswer = 'D';

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === correctAnswer) {
      setIsCorrect(true);
      onFeedback?.(
        '💡 ✅ Betul — Hebat! Kamu berjaya kesan ralat logik. Simbol perbandingan mesti menggunakan ≥ supaya pelajar yang membayar penuh dikira sebagai Lunas.',
        true // correct -> green glow
      );
      if (onBadgeEarned) onBadgeEarned('Master Pemulih Logik');
    } else {
      setIsCorrect(false);
      onFeedback?.(
        '💡 ❌ Masih belum tepat. Logik perbandingan dalam pseudokod menyebabkan status bayaran dipaparkan salah. Semak semula formula dan tanda perbandingan — sistem perlu mengira baki dahulu sebelum menentukan sama ada bayaran pelajar telah lunas atau belum.',
        false // incorrect -> red glow
      );
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsCorrect(false);
    onFeedback?.('Struktur telah direset. Cuba semula.', null);
  };

  return (
    <div>
      <h3>TAHAP 4: PENYAHPEPIJAT</h3>
      <p>Sistem kewangan gagal mengira baki yuran dengan tepat. Pelajar yang bayar penuh masih dipaparkan sebagai “Belum Lunas”.</p>
      <hr />

      <div className="quiz-container" style={{ display: 'flex', gap: '20px' }}>
        {/* Pseudokod */}
        <div className="pseudocode-box" style={{ width: '48%' }}>
          <h4>Pseudokod</h4>
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
          <h4>Maklumat Output</h4>
          <table className="output-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #333', padding: '5px' }}>Input</th>
                <th style={{ border: '1px solid #333', padding: '5px' }}>Output Sistem</th>
                <th style={{ border: '1px solid #333', padding: '5px' }}>Sepatutnya</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Jumlah Yuran = 1000, Jumlah Bayaran = 1000</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Belum Lunas ❌</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Lunas ✅</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Jumlah Yuran = 1500, Jumlah Bayaran = 1000</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Belum Lunas ✅</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Belum Lunas ✅</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Jumlah Yuran = 1200, Jumlah Bayaran = 1300</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Belum Lunas ❌</td>
                <td style={{ border: '1px solid #333', padding: '5px' }}>Status = Lunas ✅</td>
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
          onClick={() => setSelectedAnswer('A')}
        >
          A. Formula baki tidak dikira dengan betul.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'B' ? 'selected' : ''}`}
          onClick={() => setSelectedAnswer('B')}
        >
          B. Formula baki tidak dikira dengan betul.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'C' ? 'selected' : ''}`}
          onClick={() => setSelectedAnswer('C')}
        >
          C. Paparan output dilakukan sebelum proses penentuan status.
        </button>
        <button
          className={`choice-button ${selectedAnswer === 'D' ? 'selected' : ''}`}
          onClick={() => setSelectedAnswer('D')}
        >
          D. Syarat logik tidak tepat — perlu guna “≥” untuk status lunas.
        </button>
      </div>

      <hr />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={handleReset} className="primary-button">Buat Semula</button>
        <button onClick={checkAnswer} className="primary-button">Semak Jawapan</button>
        <button
          onClick={isCorrect ? onContinue : undefined}
          className="primary-button"
          style={{
            backgroundColor:'#2ecc71',
            opacity: isCorrect ? 1 : 0.5,
            cursor: isCorrect ? 'pointer' : 'not-allowed'
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
