import React, { useState } from 'react';
import MissionLayout from './MissionLayout';
import Mission2_Penguraian from './Mission2_Penguraian';
import Mission2_Pengabstrakan from './Mission2_Pengabstrakan';
import Mission2_Pembinaan from './Mission2_Pembinaan';
import Mission2_Penyahpepijat from './Mission2_Penyahpepijat';
import Mission2_Complete from './Mission2_Complete';

function Mission2({ onMissionComplete }) {
  const [missionPhase, setMissionPhase] = useState('penguraian');
  const [totalMissionScore, setTotalMissionScore] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  
  // Global feedback state for Robot
  const [feedbackText, setFeedbackText] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  // --- API HELPERS ---
  const savePhaseScore = async (phaseName, score) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mission: 2, phase: phaseName, isCorrect: score > 0, score: score, badge: null })
      });
    } catch (e) { console.error("Save failed", e); }
  };

  const saveBadge = async (badgeName) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mission: 2, phase: missionPhase, isCorrect: true, score: 0, badge: badgeName })
      });
    } catch (e) { console.error("Badge save failed", e); }
  };

  // --- FEEDBACK HANDLER ---
  const handleFeedback = (message, duration = 3000, correctState = null) => {
    setFeedbackText(message);

    // Pass true/false/null for robot glow
    setIsCorrect(correctState);

    setTimeout(() => {
      setFeedbackText('');
      setIsCorrect(null);
    }, duration);
  };

  // --- PHASE COMPLETION HANDLER ---
  const handlePhaseComplete = (nextPhase, scoreEarned, badgeEarned = null) => {
    const isCorrectAnswer = scoreEarned > 0;

    setTotalMissionScore(prev => prev + scoreEarned);
    if (badgeEarned) {
      setEarnedBadges(prev => [...prev, badgeEarned]);
    }

    // Save data to backend
    savePhaseScore(missionPhase, scoreEarned);
    if (badgeEarned) saveBadge(badgeEarned);

    // Set robot glow for phase completion
    setIsCorrect(isCorrectAnswer);

    setMissionPhase(nextPhase);
    setFeedbackText('');
  };

  const robotTexts = {
    penguraian: "Kenal pasti data yang diperlukan, proses utama, dan hasil akhir. Seret kad ke kotak Input, Proses dan Output berdasarkan urutan logik sistem.",
    pengabstrakan: "Tumpukan kepada data yang mempengaruhi keputusan pelajar. Pilih maklumat yang penting untuk menentukan lulus atau gagal. Jangan terpedaya dengan data tambahan!",
    pembinaan: "Padankan setiap baris pseudokod dengan simbol carta alir yang betul. Seret langkah pseudokod ke kotak carta alir yang sepadan.",
    penyahpepijat: "Sistem peperiksaan mengalami ralat! Semak pseudokod dan output, kenal pasti ralat logik dan pilih pembetulan yang paling tepat.",
    complete: "Hebat! Sistem peperiksaan kini bebas ralat. Anda boleh kembali ke Kampus Digital."
  };

  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission2_Penguraian 
            onContinue={(score) => handlePhaseComplete('pengabstrakan', score)}
            onFeedback={handleFeedback} 
          />
        );
      case 'pengabstrakan':
        return (
          <Mission2_Pengabstrakan 
            onContinue={(score) => handlePhaseComplete('pembinaan', score)}
            onFeedback={handleFeedback}
          />
        );
      case 'pembinaan':
        return (
          <Mission2_Pembinaan 
            onContinue={(score, badge) => handlePhaseComplete('penyahpepijat', score, badge)}
            onFeedback={handleFeedback}
          />
        );
      case 'penyahpepijat':
        return (
          <Mission2_Penyahpepijat 
            onContinue={(score, badge) => handlePhaseComplete('complete', score, badge)}
            onFeedback={handleFeedback}
          />
        );
      case 'complete':
        return (
          <Mission2_Complete 
            score={totalMissionScore} 
            badges={earnedBadges}
            onContinue={() => onMissionComplete(totalMissionScore, earnedBadges)} 
          />
        );
      default:
        return <div>Memuatkan...</div>;
    }
  };

  return (
    <MissionLayout 
      robotText={feedbackText || robotTexts[missionPhase]}
      isCorrect={isCorrect} // ✅ robot glow based on correctness
    >
      {renderPhase()}
    </MissionLayout>
  );
}

export default Mission2;
