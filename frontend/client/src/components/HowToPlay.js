import React, { useEffect, useState } from 'react';

const hoverAudio = new Audio('/hover.mp3');
hoverAudio.volume = 0.4;

const playHoverSound = () => {
    try { hoverAudio.currentTime = 0; hoverAudio.play(); } catch (e) { }
};

function HowToPlay({ onContinue }) {
    const [animateCards, setAnimateCards] = useState(false);
    const [animateButton, setAnimateButton] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setAnimateCards(true), 200);
        const timer2 = setTimeout(() => setAnimateButton(true), 800);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleButtonClick = () => onContinue();

    const cardBaseStyle = {
        flex: '1 1 400px',
        backgroundColor: '#282c34',
        border: '1px solid #79f8f8',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 0 10px rgba(121,248,248,0.2)',
        textAlign: 'left',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: '20px',
            gap: '60px',
            backgroundColor: '#1f2228',
            color: '#fff',
            textAlign: 'center'
        }}>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '30px',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {/* Left Card */}
                <div style={{
                    ...cardBaseStyle,
                    transform: animateCards ? 'translateY(0)' : 'translateY(50px)',
                    opacity: animateCards ? 1 : 0,
                    transition: 'all 0.8s ease-out',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px #79f8f8, 0 0 15px #00e5ff'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 10px rgba(121,248,248,0.2)'}
                >
                    <h2 style={{ color: '#79f8f8', marginBottom: '15px' }}>✨ Apa itu AlgoQuest?</h2>
                    <p>AlgoQuest ialah permainan serius untuk melatih pemikiran algoritma melalui tugasan autentik dunia kampus.</p>
                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Setiap misi menguji 4 kemahiran DAAD:</p>
                    <ul style={{ marginLeft: '20px', lineHeight: '1.5' }}>
                        <li>Penguraian - Pecahkan masalah kepada bahagian kecil</li>
                        <li>Pengabstrakan - Kenal pasti maklumat penting</li>
                        <li>Pembinaan Algoritma - Susun langkah penyelesaian</li>
                        <li>Penyahpepijat - Kesan dan betulkan ralat</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', color: '#79f8f8', marginTop: '10px' }}>
                        🎮 Objektif: Selesaikan 3 misi dan kumpul lencana pencapaian!
                    </p>
                </div>

                {/* Right Card */}
                <div style={{
                    ...cardBaseStyle,
                    transform: animateCards ? 'translateY(0)' : 'translateY(50px)',
                    opacity: animateCards ? 1 : 0,
                    transition: 'all 0.8s ease-out 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px #79f8f8, 0 0 15px #00e5ff'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 10px rgba(121,248,248,0.2)'}
                >
                    <h2 style={{ color: '#79f8f8', marginBottom: '15px' }}>🎮 Cara Bermain</h2>
                    <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Pilih misi (Unit Akademik, Unit Peperiksaan, Unit Kewangan)</li>
                        <li>Baca naratif dan arahan yang diberikan oleh Robot Algo.</li>
                        <li>Lengkapkan tugasan pada setiap fasa (Penguraian, Pengabstrakan, Pembinaan Algoritma, Penyahpepijat).</li>
                        <li>Tekan butang simpan untuk menyimpan jawapan.</li>
                        <li>Setiap jawapan betul akan memberi anda mata.</li>
                        <li>Tekan hantar untuk mengetahui markah, ganjaran dan lencana untuk setiap misi.</li>
                    </ul>
                </div>
            </div>

            {/* Continue Button */}
            <button
                onClick={handleButtonClick}
                onMouseEnter={playHoverSound}
                style={{
                    background: 'linear-gradient(135deg, #79f8f8, #00e5ff)',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    padding: '12px 30px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s ease, box-shadow 0.3s ease, opacity 0.6s',
                    opacity: animateButton ? 1 : 0,
                    transform: animateButton ? 'scale(1)' : 'scale(0.8)',
                    animation: animateButton ? 'pulse 1.5s infinite alternate' : 'none'
                }}
            >
                Seterusnya
            </button>

            {/* Inline keyframes for pulse */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

export default HowToPlay;
