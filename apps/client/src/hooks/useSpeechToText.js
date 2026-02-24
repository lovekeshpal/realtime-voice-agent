// apps/client/src/hooks/useSpeechToText.js

import { useRef, useState } from "react";

export const useSpeechToText = (onFinalText) => {
    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);

        recognition.onresult = (event) => {
            console.log("Speech result event:", event);

            let finalText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                console.log("Transcript:", transcript);

                if (event.results[i].isFinal) {
                    finalText += transcript;
                }
            }

            if (finalText) {
                console.log("Final text:", finalText);
                onFinalText(finalText);
            }
        };

        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
    };

    return {
        startListening,
        stopListening,
        listening,
    };
};