import { useState, useEffect, useCallback } from 'react';

interface UseVoiceInputReturn {
    isListening: boolean;
    transcript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
}

export function useVoiceInput(): UseVoiceInputReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'en-US'; // Default to English, could be dynamic

                recognitionInstance.onstart = () => {
                    setIsListening(true);
                    setError(null);
                };

                recognitionInstance.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            // Interim results could be handled here if needed
                        }
                    }
                    if (finalTranscript) {
                        setTranscript((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
                    }
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setError(event.error);
                    setIsListening(false);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            } else {
                setIsSupported(false);
                setError('Speech recognition not supported in this browser.');
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
    };
}
