import React, { useState } from 'react';
import MissionLayout from './MissionLayout';
import Mission3_Penguraian from './Mission3_Penguraian';
import Mission3_Pengabstrakan from './Mission3_Pengabstrakan';
import Mission3_Pembinaan from './Mission3_Pembinaan';
import Mission3_Penyahpepijat from './Mission3_Penyahpepijat';
import Mission3_Complete from './Mission3_Complete';

function Mission3({ onMissionComplete }) {
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
        body: JSON.stringify({ mission: 3, phase: phaseName, isCorrect: score > 0, score: score, badge: null })
      });
    } catch (e) { console.error("Save failed", e); }
  };

  const saveBadge = async (badgeName) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mission: 3, phase: missionPhase, isCorrect: true, score: 0, badge: badgeName })
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

    // Update totals and badges
    setTotalMissionScore(prev => prev + scoreEarned);
    if (badgeEarned) setEarnedBadges(prev => [...prev, badgeEarned]);

    // Save to backend
    savePhaseScore(missionPhase, scoreEarned);
    if (badgeEarned) saveBadge(badgeEarned);

    // Robot glow for phase completion
    setIsCorrect(isCorrectAnswer);

    setMissionPhase(nextPhase);
    setFeedbackText('');
  };

  const robotTexts = {
    penguraian: "Pelajar membayar tiga jenis yuran iaitu yuran pengajian, yuran asrama dan yuran aktiviti pelajar. Mari bantu saya mengenal pasti apa yang masuk ke dalam sistem (Input), apa yang sistem buat (Proses) dan apa hasil akhirnya (Output).",
    pengabstrakan: "Hai! Saya akan bantu anda mengenal pasti maklumat penting dan menyusun langkah logik bagi proses bayaran pelajar. Pilih hanya data yang perlu dalam sistem kewangan dan susun langkah pseudokod yang logik bagi setiap pelajar.",
    pembinaan: "Bantu Sistem Kewangan menyusun langkah algoritma bagi memproses bayaran yuran setiap pelajar. Seret dan susun langkah pseudokod yang betul mengikut urutan logik — daripada input hingga paparan hasil akhir!",
    penyahpepijat: "Sistem Kewangan mengesan keputusan yang salah walaupun bayaran telah dibuat penuh. Bantu saya kenal pasti bahagian pseudokod yang menyebabkan status ‘Belum Lunas’ dipaparkan walaupun jumlah bayaran mencukupi!",
    complete: "Tahniah! Anda telah menyelesaikan Unit Kewangan."
  };

  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission3_Penguraian 
            onContinue={(score) => handlePhaseComplete('pengabstrakan', score)}
            onFeedback={handleFeedback} 
          />
        );
      case 'pengabstrakan':
        return (
          <Mission3_Pengabstrakan 
            onContinue={(score) => handlePhaseComplete('pembinaan', score)}
            onFeedback={handleFeedback}
          />
        );
      case 'pembinaan':
        return (
          <Mission3_Pembinaan 
            onContinue={(score, badge) => handlePhaseComplete('penyahpepijat', score, badge)}
            onFeedback={handleFeedback}
          />
        );
      case 'penyahpepijat':
        return (
          <Mission3_Penyahpepijat 
            onContinue={(score, badge) => handlePhaseComplete('complete', score, badge)}
            onFeedback={handleFeedback}
          />
        );
      case 'complete':
        return (
          <Mission3_Complete 
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
      isCorrect={isCorrect} // ✅ glow control
    >
      {renderPhase()}
    </MissionLayout>
  );
}

export default Mission3;
