import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    isListening?: boolean;
    onStateChange?: (isListening: boolean) => void;
    placeholder?: string;
    className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
    onTranscript,
    onStateChange,
    className = ''
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    // Use refs to keep latest callbacks without triggering re-effects
    const onTranscriptRef = useRef(onTranscript);
    const onStateChangeRef = useRef(onStateChange);
    const recognitionRef = useRef<any>(null);
    const toast = useToast();

    // Update refs when props change
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        onStateChangeRef.current = onStateChange;
    }, [onStateChange]);

    // Initialize Speech Recognition ONCE
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                // Only send if we have actual final text
                if (finalTranscript && onTranscriptRef.current) {
                    onTranscriptRef.current(finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied');
                    setIsListening(false);
                    if (onStateChangeRef.current) onStateChangeRef.current(false);
                }
            };

            recognition.onend = () => {
                // When it ends naturally or by error, update state
                setIsListening(false);
                if (onStateChangeRef.current) onStateChangeRef.current(false);
            };

            recognitionRef.current = recognition;
        } else {
            setIsSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!isSupported) {
            toast.error('Voice input not supported in this browser');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
                if (onStateChangeRef.current) onStateChangeRef.current(true);
                toast.info('Listening... Speak now');
            } catch (error) {
                console.error("Failed to start recording:", error);
                setIsListening(false);
            }
        }
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-200 ${isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse ring-2 ring-red-400 ring-opacity-50'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                } ${className}`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
        >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
    );
};
