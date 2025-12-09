import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playClickSound, playHoverSound } from '../audioUtils';

function Hub({ onStartMission1, onStartMission2, onStartMission3, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(location.state?.user || null);
    const [progress, setProgress] = useState({});
    const [progressPercent, setProgressPercent] = useState(0);

    // Handler to play sound and start mission
    const handleMissionStart = (startFunction) => {
        try { playClickSound(); } catch (e) { }
        if (typeof startFunction === 'function') {
            startFunction();
        }
    };

    useEffect(() => {
        const fetchUserAndProgress = async () => {
            const token = localStorage.getItem('token');

            if (!user && token) {
                try {
                    const res = await fetch('https://algoquest-api.onrender.com/api/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data); 
                    } else {
                        localStorage.removeItem('token');
                        navigate('/login', { replace: true });
                    }
                } catch (err) {
                    console.error('Failed to fetch user:', err);
                }
            }

            if (token) {
                try {
                    const response = await fetch('https://algoquest-api.onrender.com/api/progress', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (!response.ok) throw new Error('Could not fetch progress');

                    const data = await response.json();
                    const progressData = {};
                    
                    for (const record of data) {
                        progressData[record.mission_id] = {
                            score: record.score,
                            badges: record.badges || [] 
                        };
                    }
                    setProgress(progressData);

                    const completedMissions = Object.keys(progressData).length;
                    setProgressPercent(Math.round((completedMissions / 3) * 100));
                } catch (err) {
                    console.error(err.message);
                }
            }
        };

        fetchUserAndProgress();
    }, [user, navigate]);

    const getScore = (missionId) => 
        progress[missionId]?.score !== undefined ? progress[missionId].score : '-';

    const isMissionCompleted = (missionId) => 
        progress[missionId]?.score !== undefined;

    const getStatus = (missionId) => {
        if (isMissionCompleted(missionId)) return { text: 'Selesai', color: '#2ecc71' };
        return { text: 'Belum Selesai', color: '#f39c12' };
    };

    // ✅ FIXED: Specific Badge Mapping for Each Mission
    const getBadges = (missionId) => {
        // The backend sends ALL user badges in every record. 
        // We grab the list from the current mission object (or any object, they are the same list).
        const allBadges = progress[missionId]?.badges || [];

        if (allBadges.length === 0) return '-';

        const displayList = [];

        // Check specifically for badges belonging to THIS mission
        if (missionId === 'mission1') {
            // Check for new format AND old format (for compatibility)
            if (allBadges.includes('mission1-pembinaan-master') || allBadges.includes('pembinaan-master')) {
                displayList.push('Master Algoritma');
            }
            if (allBadges.includes('mission1-debugging-master') || allBadges.includes('debugging-master')) {
                displayList.push('Master Pemulih Logik');
            }
        } 
        else if (missionId === 'mission2') {
            if (allBadges.includes('mission2-pembinaan-master')) displayList.push('Master Algoritma');
            if (allBadges.includes('mission2-debugging-master')) displayList.push('Master Pemulih Logik');
        }
        else if (missionId === 'mission3') {
            if (allBadges.includes('mission3-pembinaan-master')) displayList.push('Master Algoritma');
            if (allBadges.includes('mission3-debugging-master')) displayList.push('Master Pemulih Logik');
        }

        if (displayList.length === 0) return '-';

        // Remove duplicates and join
        return [...new Set(displayList)].join(' | ');
    };

    const userName = user?.name || 'Wira'; 

    const renderMissionCard = (title, description, missionId, onStart) => {
        const status = getStatus(missionId);
        const badgesDisplay = getBadges(missionId);

        return (
            <div className="mission-card" style={{ textAlign: 'center' }} onMouseEnter={playHoverSound}>
                <h3>{title}</h3>
                <p style={{ textAlign: 'center' }}>{description}</p>
                <p style={{ textAlign: 'center' }}>📊Markah: {getScore(missionId)}</p>
                <p style={{ textAlign: 'center' }}>🏅Lencana: {badgesDisplay}</p>
                
                <div
                    className="status"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        fontWeight: 'bold', fontSize: '1.5vmin', justifyContent: 'center', margin: '10px 0',
                    }}
                >
                    <span
                        className="status-circle"
                        style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            backgroundColor: status.color, display: 'inline-block',
                            boxShadow: `0 0 6px ${status.color}`,
                            animation: `pulse-${missionId} 2s infinite ease-in-out`,
                        }}
                    ></span>
                    <span style={{ lineHeight: '16px' }}>{status.text}</span>
                </div>

                <button 
                    onClick={() => handleMissionStart(onStart)} 
                    onMouseEnter={playHoverSound}
                >
                    Mulakan Misi
                </button>

                <style>
                    {`
                        @keyframes pulse-${missionId} {
                            0% { box-shadow: 0 0 4px ${status.color}; transform: scale(1); }
                            50% { box-shadow: 0 0 12px ${status.color}; transform: scale(1.1); }
                            100% { box-shadow: 0 0 4px ${status.color}; transform: scale(1); }
                        }
                    `}
                </style>
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
                style={{ width: '300px', margin: 'auto', backgroundColor: '#c74f4f' }}
            >
                Tamat Permainan
            </button>
        </div>
    );
}

export default Hub;