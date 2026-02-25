import { useRef } from "react";

export const useSpeech = () => {
    const speakingRef = useRef(false);

    const speak = (text) => {
        if (!text) return;

        // stop previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        speakingRef.current = true;

        utterance.onend = () => {
            speakingRef.current = false;
        };

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        speakingRef.current = false;
    };

    return { speak, stop };
};