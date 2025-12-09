import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playClickSound, playHoverSound } from '../audioUtils';

function Hub({ onStartMission1, onStartMission2, onStartMission3, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(location.state?.user || null);
    const [progress, setProgress] = useState({});
    const [progressPercent, setProgressPercent] = useState(0);

    const handleMissionStart = (startFunction) => {
        try { playClickSound(); } catch (e) {}
        if (typeof startFunction === 'function') startFunction();
    };

    // Update badges immediately when earned
    const handleBadgeEarned = (missionId, badgeName) => {
        setProgress(prev => {
            const missionProgress = prev[missionId] || { score: 0, badges: [] };
            return {
                ...prev,
                [missionId]: {
                    ...missionProgress,
                    badges: [...new Set([...missionProgress.badges, badgeName])]
                }
            };
        });
    };

    useEffect(() => {
        const fetchUserAndProgress = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            if (!user) {
                try {
                    const res = await fetch('https://algoquest-api.onrender.com/api/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (res.ok) setUser(await res.json());
                    else {
                        localStorage.removeItem('token');
                        navigate('/login', { replace: true });
                    }
                } catch (err) { console.error('Failed to fetch user:', err); }
            }

            try {
                const response = await fetch('https://algoquest-api.onrender.com/api/progress', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Could not fetch progress');
                const data = await response.json();

                const progressData = {};
                data.forEach(record => {
                    progressData[record.mission_id] = {
                        score: record.score,
                        badges: record.badges || []
                    };
                });

                setProgress(progressData);
                setProgressPercent(Math.round((Object.keys(progressData).length / 3) * 100));
            } catch (err) { console.error(err.message); }
        };

        fetchUserAndProgress();
    }, [user, navigate]);

    const getScore = (missionId) => progress[missionId]?.score ?? '-';
    const getBadges = (missionId) => progress[missionId]?.badges || [];
    const isMissionCompleted = (missionId) => progress[missionId]?.score !== undefined;
    const getStatus = (missionId) => isMissionCompleted(missionId) 
        ? { text: 'Selesai', color: '#2ecc71' } 
        : { text: 'Belum Selesai', color: '#f39c12' };

    const userName = user?.name || 'Pemain!';

    const renderMissionCard = (title, description, missionId, onStart) => {
        const status = getStatus(missionId);
        const badges = getBadges(missionId);

        return (
            <div className="mission-card" style={{ textAlign: 'center', marginBottom: '20px' }} onMouseEnter={playHoverSound}>
                <h3>{title}</h3>
                <p>{description}</p>
                <p>📊 Markah: {getScore(missionId)}</p>

                {badges.length > 0 && (
                    <div>
                        <p>🏅 Lencana:</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {badges.map((badge, idx) => (
                                <li key={idx}>{badge}</li>
                            ))}
                        </ul>
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

                <button onClick={() => handleMissionStart(() => onStart(handleBadgeEarned))} onMouseEnter={playHoverSound}>
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
        </div>
    );
}

export default Hub;
