import React, { useState } from 'react';
import MissionLayout from './MissionLayout';
import Mission1_Penguraian from './Mission1_Penguraian';
import Mission1_Pengabstrakan from './Mission1_Pengabstrakan';
import Mission1_Pembinaan from './Mission1_Pembinaan';
import Mission1_Penyahpepijat from './Mission1_Penyahpepijat';
import Mission1_Complete from './Mission1_Complete';

const ROBOT_TEXTS = {
  penguraian: "Hai! Mari kita bantu Kampus Digital mengenal pasti semula Input, Proses, dan Output dalam modul pendaftaran pelajar.Seret setiap item ke tempat yang betul supaya aliran data pelajar lengkap dan teratur!",
  pengabstrakan: "Klik dan seret maklumat penting ke ruangan Maklumat Penting. Kemudian, susun langkah pendaftaran di bahagian kanan supaya sistem berfungsi dengan betul!",
  pembinaan: "Klik anak panah ➡️ untuk pindahkan langkah ke kotak algoritma. Bila semua langkah dah pindah, guna anak panah ⬆️ dan ⬇️ untuk susun ikut urutan jujukan.",
  penyahpepijat: "Hmm... nampaknya sistem cetak slip dulu sebelum daftar kursus. Susun semula langkah dengan isi nombor urutan yang betul ya!",
  complete: "Kerja yang bagus! Sistem pendaftaran pelajar telah dipulihkan. Anda boleh kembali ke Kampus Digital."
};

function Mission1({ onMissionComplete }) {
  const [missionPhase, setMissionPhase] = useState('penguraian');
  const [totalScore, setTotalScore] = useState(0);
  const [robotText, setRobotText] = useState(ROBOT_TEXTS['penguraian']);
  const [isCorrect, setIsCorrect] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);

  // --------------------------
  // Glow & feedback function
  // --------------------------
  const onFeedback = (text, duration = 3000, correctState = null) => {
    setRobotText(text);

    // Set robot glow: true=green, false=red, null=normal
    setIsCorrect(correctState);

    setTimeout(() => {
      setIsCorrect(null);
      setRobotText(ROBOT_TEXTS[missionPhase]);
    }, duration);
  };

  // --------------------------
  // Unified Backend Submit
  // --------------------------
  const submitPhaseToBackend = async (phaseName, isCorrectAnswer, score, badge) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch("https://algoquest-api.onrender.com/api/mission/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mission: 1,
          phase: phaseName,
          isCorrect: isCorrectAnswer,
          score: score,
          badge: badge
        })
      });
    } catch (e) {
      console.error("Submit mission data failed", e);
    }
  };

  // --------------------------
  // Phase Completion Handler
  // --------------------------
  const handlePhaseComplete = (nextPhase, scoreEarned, badgeEarned = null) => {
    const isCorrectAnswer = scoreEarned > 0;

    // Send to backend
    submitPhaseToBackend(missionPhase, isCorrectAnswer, scoreEarned, badgeEarned);

    setTotalScore(prev => prev + scoreEarned);

    if (badgeEarned) {
      setEarnedBadges(prev => [...prev, badgeEarned]);
    }

    // Update robot glow for phase completion
    setIsCorrect(isCorrectAnswer);

    setMissionPhase(nextPhase);
    setRobotText(ROBOT_TEXTS[nextPhase]);
  };

  // --------------------------
  // Render Current Phase
  // --------------------------
  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission1_Penguraian
            onContinue={(score) => handlePhaseComplete('pengabstrakan', score)}
            onFeedback={onFeedback}
          />
        );
      case 'pengabstrakan':
        return (
          <Mission1_Pengabstrakan
            onContinue={(score) => handlePhaseComplete('pembinaan', score)}
            onFeedback={onFeedback}
          />
        );
      case 'pembinaan':
        return (
          <Mission1_Pembinaan
            onContinue={(score, badge) => handlePhaseComplete('penyahpepijat', score, badge)}
            onFeedback={onFeedback}
          />
        );
      case 'penyahpepijat':
        return (
          <Mission1_Penyahpepijat
            onContinue={(score, badge) => handlePhaseComplete('complete', score, badge)}
            onFeedback={onFeedback}
          />
        );
      case 'complete':
        return (
          <Mission1_Complete
            score={totalScore}
            badges={earnedBadges}
            onContinue={() => onMissionComplete(totalScore, earnedBadges)}
          />
        );
      default:
        return <div>Memuatkan...</div>;
    }
  };

  return (
    <MissionLayout
      robotText={robotText}
      isCorrect={isCorrect} // ✅ pass correct/wrong status for glow
    >
      {renderPhase()}
    </MissionLayout>
  );
}

export default Mission1;
