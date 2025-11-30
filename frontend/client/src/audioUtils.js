// audioUtils.js

// Create audio objects once (ensure these files are in your public folder)
const clickAudio = new Audio('/click.mp3');
const hoverAudio = new Audio('/hover.mp3');

// Optional: adjust volumes
clickAudio.volume = 1.0;   // Full volume (change if you want)
hoverAudio.volume = 0.4;   // Softer hover sound

/**
 * Plays the click sound.
 * Uses async/await to properly handle the Promise returned by play()
 * so that if the browser blocks playback (no user interaction yet),
 * the rejection is caught and does NOT cause an uncaught runtime error.
 */
export const playClickSound = async () => {
    try {
        clickAudio.currentTime = 0;
        await clickAudio.play();
    } catch (e) {
        // Playback blocked or failed – ignore silently
        // console.warn("Click sound blocked:", e);
    }
};

/**
 * Plays the hover sound.
 * Also uses async/await to catch the play() Promise rejection,
 * preventing "Uncaught (in promise)" runtime errors.
 */
export const playHoverSound = async () => {
    try {
        hoverAudio.currentTime = 0;
        await hoverAudio.play();
    } catch (e) {
        // Playback blocked or failed – ignore silently
        // console.warn("Hover sound blocked:", e);
    }
};
