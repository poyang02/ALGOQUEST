import React, { useState } from 'react';
import MissionLayout from './MissionLayout';
import Mission1_Penguraian from './Mission1_Penguraian';
import Mission1_Pengabstrakan from './Mission1_Pengabstrakan';
import Mission1_Pembinaan from './Mission1_Pembinaan';
import Mission1_Penyahpepijat from './Mission1_Penyahpepijat';
import Mission1_Complete from './Mission1_Complete';

function Mission1({ onMissionComplete }) {
  const [missionPhase, setMissionPhase] = useState('penguraian');
  const [score, setScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [badges, setBadges] = useState([]);

  // ⭐ NEW — global correctness state for robot glow
  const [isCorrect, setIsCorrect] = useState(null);

  const handleFeedback = (message, duration = 3000, correctState = null) => {
    setFeedbackText(message);

    // ⭐ update robot glow color (green/red)
    setIsCorrect(correctState);

    setTimeout(() => {
      setFeedbackText('');
      setIsCorrect(null); // Reset glow after fade
    }, duration);
  };

  const handleContinue = (nextPhase, points = 0, earnedBadge = null) => {
    setScore(prev => prev + points);
    if (earnedBadge) setBadges(prev => [...prev, earnedBadge]);
    setMissionPhase(nextPhase);
    setFeedbackText('');
    setIsCorrect(null);
  };

  const robotTexts = {
    penguraian:
      "Hai! Mari kita bantu Kampus Digital mengenal pasti semula Input, Proses, dan Output dalam modul pendaftaran pelajar.Seret setiap item ke tempat yang betul supaya aliran data pelajar lengkap dan teratur!",
    pengabstrakan:
      "Klik dan seret maklumat penting ke ruangan Maklumat Penting. Kemudian, susun langkah pendaftaran di bahagian kanan supaya sistem berfungsi dengan betul!",
    pembinaan:
      "Klik anak panah ➡️ untuk pindahkan langkah ke kotak algoritma. Bila semua langkah dah pindah, guna anak panah ⬆️ dan ⬇️ untuk susun ikut urutan jujukan.",
    penyahpepijat:
      "Hmm... nampaknya sistem cetak slip dulu sebelum daftar kursus. Susun semula langkah dengan isi nombor urutan yang betul ya!",
    complete:
      "Kerja yang bagus! Sistem pendaftaran pelajar telah dipulihkan. Anda boleh kembali ke Kampus Digital."
  };

  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission1_Penguraian
            onContinue={() => handleContinue('pengabstrakan', 25)}
            onFeedback={handleFeedback}
          />
        );
      case 'pengabstrakan':
        return (
          <Mission1_Pengabstrakan
            onContinue={() => handleContinue('pembinaan', 25)}
            onFeedback={handleFeedback}
          />
        );
      case 'pembinaan':
        return (
          <Mission1_Pembinaan
            onContinue={() => handleContinue('penyahpepijat', 25, 'Master Algoritma')}
            onFeedback={handleFeedback}
          />
        );
      case 'penyahpepijat':
        return (
          <Mission1_Penyahpepijat
            onContinue={() => handleContinue('complete', 25, 'Master Pemulih Logik')}
            onFeedback={handleFeedback}
          />
        );
      case 'complete':
        return (
          <Mission1_Complete
            score={score}
            badges={badges}
            onContinue={() => onMissionComplete(score)}
          />
        );
      default:
        return <div>Memuatkan...</div>;
    }
  };

  return (
    <MissionLayout
      robotText={feedbackText || robotTexts[missionPhase]}
      isCorrect={isCorrect} // ⭐ SEND glow status to layout
    >
      {renderPhase()}
    </MissionLayout>
  );
}

export default Mission1;
