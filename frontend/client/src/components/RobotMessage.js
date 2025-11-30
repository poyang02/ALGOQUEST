import React, { useState, useEffect } from 'react';

function RobotMessage({ message }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (!message) return;

        setDisplayedText(''); // Reset text when new message arrives
        setIsTyping(true);

        const textLength = message.length;
        const duration = Math.min(textLength * 50, 2500); // 50ms per character, max 2.5s

        // 1. Set up the typing animation using CSS variables for keyframe steps
        const typingStyle = document.createElement('style');
        typingStyle.innerHTML = `
            .typewriter { 
                width: ${textLength}ch;
                animation: typing ${duration}ms steps(${textLength}, end), blink 0.5s step-end infinite;
                animation-fill-mode: forwards;
                border-right: 2px solid rgba(121, 248, 248, 0.7); 
            }
            @keyframes typing {
                from { width: 0 }
                to { width: ${textLength}ch }
            }
        `;
        document.head.appendChild(typingStyle);
        
        // 2. Clear typing state after animation duration
        const typingTimer = setTimeout(() => {
            setIsTyping(false);
        }, duration);

        return () => {
            clearTimeout(typingTimer);
            document.head.removeChild(typingStyle);
        };
    }, [message]);

    if (!message) return null; // Hide if no message is set

    return (
        <div className="robot-speech-container">
            <div className="robot-speech-bubble">
                {/* 3. The typewriter class controls the animation */}
                <p className={isTyping ? 'typewriter' : ''} style={{ whiteSpace: 'normal', width: 'auto', borderRight: isTyping ? '2px solid rgba(121, 248, 248, 0.7)' : 'none'}}>
                    {message}
                </p>
            </div>
        </div>
    );
}

export default RobotMessage;