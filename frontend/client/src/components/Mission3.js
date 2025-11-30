import React, { useState, useEffect } from 'react';
import MissionLayout from './MissionLayout';
import Mission3_Penguraian from './Mission3_Penguraian';
import Mission3_Pengabstrakan from './Mission3_Pengabstrakan';
import Mission3_Pembinaan from './Mission3_Pembinaan';
import Mission3_Penyahpepijat from './Mission3_Penyahpepijat';
import Mission3_Complete from './Mission3_Complete';

function Mission3({ onMissionComplete }) {
  const [missionPhase, setMissionPhase] = useState('penguraian');
  const [score, setScore] = useState(0);
  const [robotText, setRobotText] = useState('');
  const [earnedBadges, setEarnedBadges] = useState([]); // store all badges
  const [isCorrect, setIsCorrect] = useState(null);

  // Update robotText when missionPhase changes
  useEffect(() => {
    switch (missionPhase) {
      case 'penguraian':
        setRobotText(
          'Pelajar membayar tiga jenis yuran iaitu yuran pengajian, yuran asrama dan yuran aktiviti pelajar. Mari bantu saya mengenal pasti apa yang masuk ke dalam sistem (Input), apa yang sistem buat (Proses) dan apa hasil akhirnya (Output).'
        );
        break;
      case 'pengabstrakan':
        setRobotText(
          'Hai! Saya akan bantu anda mengenal pasti maklumat penting dan menyusun langkah logik bagi proses bayaran pelajar. Pilih hanya data yang perlu dalam sistem kewangan dan susun langkah pseudokod yang logik bagi setiap pelajar.'
        );
        break;
      case 'pembinaan':
        setRobotText(
          'Bantu Sistem Kewangan menyusun langkah algoritma bagi memproses bayaran yuran setiap pelajar. Seret dan susun langkah pseudokod yang betul mengikut urutan logik — daripada input hingga paparan hasil akhir!'
        );
        break;
      case 'penyahpepijat':
        setRobotText(
          'Sistem Kewangan mengesan keputusan yang salah walaupun bayaran telah dibuat penuh. Bantu saya kenal pasti bahagian pseudokod yang menyebabkan status ‘Belum Lunas’ dipaparkan walaupun jumlah bayaran mencukupi!'
        );
        break;
      case 'complete':
        setRobotText('Tahniah! Anda telah menyelesaikan Unit Kewangan.');
        break;
      default:
        setRobotText('');
    }

    // Reset isCorrect on phase change
    setIsCorrect(null);
  }, [missionPhase]);

  // Append badges without duplicates
  const handleBadgeEarned = (badge) => {
    setEarnedBadges((prev) => {
      if (!prev.includes(badge)) return [...prev, badge];
      return prev;
    });
  };

  const handleContinue = (nextPhase, points = 0) => {
    setScore((prev) => prev + points);
    setMissionPhase(nextPhase);
  };

  const handleFeedback = (message, correctState = null, duration = 3000) => {
    setRobotText(message);
    setIsCorrect(correctState);

    if (duration) {
      setTimeout(() => {
        setIsCorrect(null);
        // Reset robot text to phase default
        switch (missionPhase) {
          case 'penguraian':
            setRobotText(
              'Pelajar membayar tiga jenis yuran iaitu yuran pengajian, yuran asrama dan yuran aktiviti pelajar. Mari bantu saya mengenal pasti apa yang masuk ke dalam sistem (Input), apa yang sistem buat (Proses) dan apa hasil akhirnya (Output).'
            );
            break;
          case 'pengabstrakan':
            setRobotText(
              'Hai! Saya akan bantu anda mengenal pasti maklumat penting dan menyusun langkah logik bagi proses bayaran pelajar. Pilih hanya data yang perlu dalam sistem kewangan dan susun langkah pseudokod yang logik bagi setiap pelajar.'
            );
            break;
          case 'pembinaan':
            setRobotText(
              'Bantu Sistem Kewangan menyusun langkah algoritma bagi memproses bayaran yuran setiap pelajar. Seret dan susun langkah pseudokod yang betul mengikut urutan logik — daripada input hingga paparan hasil akhir!'
            );
            break;
          case 'penyahpepijat':
            setRobotText(
              'Sistem Kewangan mengesan keputusan yang salah walaupun bayaran telah dibuat penuh. Bantu saya kenal pasti bahagian pseudokod yang menyebabkan status ‘Belum Lunas’ dipaparkan walaupun jumlah bayaran mencukupi!'
            );
            break;
          case 'complete':
            setRobotText('Tahniah! Anda telah menyelesaikan Unit Kewangan.');
            break;
          default:
            setRobotText('');
        }
      }, duration);
    }
  };

  const renderPhase = () => {
    switch (missionPhase) {
      case 'penguraian':
        return (
          <Mission3_Penguraian
            onContinue={() => handleContinue('pengabstrakan', 25)}
            setRobotText={setRobotText}
            onFeedback={handleFeedback}
            isCorrect={isCorrect}
          />
        );
      case 'pengabstrakan':
        return (
          <Mission3_Pengabstrakan
            onContinue={() => handleContinue('pembinaan', 25)}
            setRobotText={setRobotText}
            onFeedback={handleFeedback}
            isCorrect={isCorrect}
          />
        );
      case 'pembinaan':
        return (
          <Mission3_Pembinaan
            onContinue={() => handleContinue('penyahpepijat', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={handleFeedback}
            isCorrect={isCorrect}
          />
        );
      case 'penyahpepijat':
        return (
          <Mission3_Penyahpepijat
            onContinue={() => handleContinue('complete', 25)}
            setRobotText={setRobotText}
            onBadgeEarned={handleBadgeEarned}
            onFeedback={handleFeedback}
            isCorrect={isCorrect}
          />
        );
      case 'complete':
        return (
          <Mission3_Complete
            score={score}
            badge={earnedBadges.join(', ')} // Show all earned badges
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

export default Mission3;
