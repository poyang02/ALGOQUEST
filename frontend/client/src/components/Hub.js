import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playClickSound, playHoverSound } from '../audioUtils';

function Hub({ onStartMission1, onStartMission2, onStartMission3, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(location.state?.user || null);
    const [progress, setProgress] = useState({});
    const [badges, setBadges] = useState({});
    const [progressPercent, setProgressPercent] = useState(0);

    const handleMissionStart = (startFunction) => {
        try { playClickSound(); } catch (e) {}
        if (typeof startFunction === 'function') startFunction();
    };

    useEffect(() => {
        const fetchUserAndProgress = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch user info if not provided
            if (!user) {
                try {
                    const res = await fetch('https://algoquest-api.onrender.com/api/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (res.ok) setUser(await res.json());
                    else {
                        localStorage.removeItem('token');
                        navigate('/login', { replace: true });
                        return;
                    }
                } catch (err) { console.error('Failed to fetch user:', err); }
            }

            // Fetch progress
            try {
                const response = await fetch('https://algoquest-api.onrender.com/api/progress', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Could not fetch progress');
                const data = await response.json();
                const progressData = {};
                data.forEach(record => {
                    progressData[record.mission_id] = { score: record.score };
                });
                setProgress(progressData);
                setProgressPercent(Math.round((Object.keys(progressData).length / 3) * 100));
            } catch (err) { console.error(err.message); }

            // Fetch mission_scores for badges
            try {
                const res = await fetch('https://algoquest-api.onrender.com/api/mission_scores', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Could not fetch mission scores');
                const data = await res.json();

                const badgeData = {};
                data.forEach(record => {
                    if (record.user_id !== user?.id) return;

                    const mid = `mission${record.mission}`;
                    if (!badgeData[mid]) badgeData[mid] = [];

                    if (record.score === 25) {
                        if (record.phase === 'pembinaan' && !badgeData[mid].includes('Master Algoritma')) {
                            badgeData[mid].push('Master Algoritma');
                        }
                        if (record.phase === 'penyahpepijat' && !badgeData[mid].includes('Master Pemulh Logik')) {
                            badgeData[mid].push('Master Pemulh Logik');
                        }
                    }
                });

                setBadges(badgeData);
            } catch (err) { console.error(err.message); }
        };

        fetchUserAndProgress();
    }, [user, navigate]);

    const getScore = (missionId) => progress[missionId]?.score ?? '-';
    const getBadges = (missionId) => badges[missionId] || [];
    const isMissionCompleted = (missionId) => progress[missionId]?.score !== undefined;
    const getStatus = (missionId) => isMissionCompleted(missionId)
        ? { text: 'Selesai', color: '#2ecc71' }
        : { text: 'Belum Selesai', color: '#f39c12' };

    const userName = user?.name || 'Pemain!';

    const renderMissionCard = (title, description, missionId, onStart) => {
        const status = getStatus(missionId);
        const missionBadges = getBadges(missionId);

        return (
            <div className="mission-card" style={{ textAlign: 'center', marginBottom: '20px' }} onMouseEnter={playHoverSound}>
                <h3>{title}</h3>
                <p>{description}</p>
                <p>📊 Markah: {getScore(missionId)}</p>

                {missionBadges.length > 0 && (
                    <div className="badges-container" style={{ margin: '10px 0' }}>
                        <h4>🏅 Lencana Diperolehi:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {missionBadges.map((badge, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '6px 16px',
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        color: '#fff',
                                        background: 'linear-gradient(135deg, #FFD700, #FFC200, #FFB000)',
                                        borderRadius: '9999px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                        overflow: 'hidden',
                                        textAlign: 'center',
                                        cursor: 'default',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                    }}
                                    className="badge"
                                >
                                    <span style={{ display: 'inline-block', width: '16px', height: '16px', marginRight: '8px' }}>⭐</span>
                                    <span>{badge}</span>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '-50%',
                                            left: '-50%',
                                            width: '200%',
                                            height: '200%',
                                            background: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                                            transform: 'rotate(25deg)',
                                            pointerEvents: 'none',
                                            animation: 'shine 2s infinite',
                                            zIndex: 0
                                        }}
                                    ></span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: 'bold', fontSize: '1.5vmin', justifyContent: 'center', margin: '10px 0'
                }}>
                    <span style={{
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: status.color, display: 'inline-block',
                        boxShadow: `0 0 6px ${status.color}`
                    }}></span>
                    <span>{status.text}</span>
                </div>

                <button onClick={() => handleMissionStart(() => onStart())} onMouseEnter={playHoverSound}>
                    Mulakan Misi
                </button>
            </div>
        );
    };

    return (
        <div className="game-container">
            <h2>SELAMAT DATANG KE KAMPUS DIGITAL, {userName}</h2>

            <div className="progress-bar-container">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
                    Bar Kemajuan: {progressPercent}%
                </div>
            </div>

            <hr />

            <div className="hub-mission-list">
                {renderMissionCard(
                    'UNIT AKADEMIK',
                    'Bantu sistem mendaftar pelajar baharu mengikut urutan langkah yang betul.',
                    'mission1',
                    onStartMission1
                )}
                {renderMissionCard(
                    'UNIT PEPERIKSAAN',
                    'Semak dan sahkan pengiraan markah pelajar bagi memastikan keputusan tepat.',
                    'mission2',
                    onStartMission2
                )}
                {renderMissionCard(
                    'UNIT KEWANGAN',
                    'Bantu sistem mengira yuran pelajar berulang mengikut bilangan kursus yang diambil.',
                    'mission3',
                    onStartMission3
                )}
            </div>

            <hr style={{ marginTop: '20px' }} />

            <button
                onClick={() => handleMissionStart(onLogout)}
                onMouseEnter={playHoverSound}
                className="primary-button"
                style={{ width: 300, margin: 'auto', backgroundColor: '#c74f4f' }}
            >
                Tamat Permainan
            </button>

            <style>{`
                @keyframes shine {
                    0% { transform: rotate(25deg) translateX(-100%); }
                    50% { transform: rotate(25deg) translateX(100%); }
                    100% { transform: rotate(25deg) translateX(-100%); }
                }
                .badge:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
            `}</style>
        </div>
    );
}

export default Hub;
