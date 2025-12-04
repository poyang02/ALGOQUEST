import React from 'react';

// Added new props: isMuted and onToggleMute
function SettingsMenu({ onClose, onLogout, onReturnToHub, isMuted, onToggleMute }) {
    
    // Simplifies the function call for returning to the Hub
    const handleGoToHub = () => {
        onClose();
        // Calls the function from App.js which contains the navigation logic
        if (onReturnToHub) onReturnToHub(); 
    };

    // Logout handler
    const handleLogoutClick = () => {
        onClose();
        onLogout(); 
    };

    return (
        <div className="settings-backdrop" onClick={onClose}>
            {/* Modal Box */}
            <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: '#79f8f8', marginBottom: '20px' }}>TETAPAN</h3>
                
                {/* 1. SAMBUNG PERMAINAN / CLOSE */}
                <button 
                    type="button"
                    onClick={onClose} 
                    className="primary-button" 
                    style={{ backgroundColor: '#2ecc71' }}
                >
                    SAMBUNG PERMAINAN
                </button>

                {/* 2. MUTE/UNMUTE MUSIC BUTTON (New) */}
                <button 
                    type="button"
                    onClick={onToggleMute} 
                    className="primary-button" 
                    style={{ 
                        // Red background when muted, blue when unmuted/playing
                        backgroundColor: isMuted ? '#cc4444' : '#1e90ff' 
                    }}
                >
                    {isMuted ? '🔇MUZIK : TIADA' : '▶️ MUZIK : ADA'}
                </button>

                {/* 4. LOG KELUAR */}
                <button 
                    type="button"
                    onClick={handleLogoutClick} 
                    className="primary-button"
                    style={{ backgroundColor: '#ff6b6b' }}
                >
                    LOG KELUAR
                </button>
            </div>
        </div>
    );
}

export default SettingsMenu;