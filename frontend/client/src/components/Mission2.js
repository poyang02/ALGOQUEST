import React, { useState, useEffect } from 'react';
import MissionLayout from './MissionLayout';
import Mission2_Penguraian from './Mission2_Penguraian';
import Mission2_Pengabstrakan from './Mission2_Pengabstrakan';
import Mission2_Pembinaan from './Mission2_Pembinaan';
import Mission2_Penyahpepijat from './Mission2_Penyahpepijat';
import Mission2_Complete from './Mission2_Complete';

const ROBOT_TEXTS = {
  penguraian:
    'Kenal pasti data yang diperlukan, proses utama, dan hasil akhir. Seret kad ke kotak Input, Proses dan Output berdasarkan urutan logik sistem.',
  pengabstrakan:
    'Tumpukan kepada data yang mempengaruhi keputusan pelajar. Pilih maklumat yang penting untuk menentukan lulus atau gagal. Jangan terpedaya dengan data tambahan yang tidak berkaitan!',
  pembinaan:
    'Bina struktur sistem dan logik berdasarkan maklumat yang dianalisis. Pastikan setiap peringkat diproses dengan betul.',
  penyahpepijat:
    'Semak pseudokod dan output, kenal pasti ralat logik, dan pilih pembetulan yang paling tepat.',
  complete: 'Tahniah! Misi telah selesai.',
};

function Mission2({ onMissionComplete }) {
  const [missionPhase, setMissionPhase] = useState('penguraian');
  const [score, setScore] = useState(0);
  const [robotText, setRobotText] = useState(ROBOT_TEXTS['penguraian']);
  const [badges, setBadges] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null); // ⭐ SAME as Mission1

  const token = localStorage.getItem('token');

  // ⭐ EXACT same glow behavior as Mission1
  const onFeedback = (text, duration = 3000, correctState = null) => {
    setRobotText(text);
    setIsCorrect(correctState);

    setTimeout(() => {
      setIsCorrect(null);             // remove glow
      setRobotText(ROBOT_TEXTS[missionPhase]); // revert text
    }, duration);
  };

  // Save progress to backend
  const saveProgress = async (currentScore, currentBadges) => {
    if (!token) return;
    try {
      await fetch('https://algoquest-api.onrender.com/api/progress/mission2', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: currentScore,
          badges: currentBadges,
        }),
      });
    } catch (err) {
      console.error('Failed to save Mission2 progress:', err);
    }
  };

  const handleBadgeEarned = (badgeName) => {
    setBadges((prev) => {
      if (!prev.includes(badgeName)) {
        const updated = [...prev, badgeName];
        saveProgress(score, updated);
        return updated;
      }
      return prev;
    });
  };

  const handleContinue = (nextPhase, points = 0) => {
    setScore((prev) => {
      const newScore = prev + points;
      saveProgress(newScore, badges);
      return newScore;
    });

    setMissionPhase(nextPhase);
    setRobotText(ROBOT_TEXTS[nextPhase]);
    setIsCorrect(null); // reset glow when changing phase (same as Mission1)
  };

  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission2_Penguraian
            onContinue={() => handleContinue('pengabstrakan', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={onFeedback} // ⭐ glow enabled
          />
        );

      case 'pengabstrakan':
        return (
          <Mission2_Pengabstrakan
            onContinue={() => handleContinue('pembinaan', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={onFeedback}
          />
        );

      case 'pembinaan':
        return (
          <Mission2_Pembinaan
            onContinue={() => handleContinue('penyahpepijat', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={onFeedback}
          />
        );

      case 'penyahpepijat':
        return (
          <Mission2_Penyahpepijat
            onContinue={() => handleContinue('complete', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={onFeedback}
          />
        );

      case 'complete':
        return (
          <Mission2_Complete
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
    <MissionLayout robotText={robotText} isCorrect={isCorrect}>
      {renderPhase()}
    </MissionLayout>
  );
}

export default Mission2;
