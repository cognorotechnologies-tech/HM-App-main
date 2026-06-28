import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Save, Download, User, Stethoscope, RefreshCcw, Check, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { transcriptService } from '../../services/transcriptService';
import { useAuthStore } from '../../store/authStore';

interface LiveTranscriptProps {
    appointmentId: string;
    onSaveTranscript?: (transcript: string) => void;
    patientId?: string; // Optional for saving
    doctorId?: string; // Optional for saving
}

interface TranscriptLine {
    speaker: 'doctor' | 'patient';
    text: string;
    timestamp: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
    appointmentId,
    onSaveTranscript,
    patientId,
    doctorId
}) => {
    const { user } = useAuthStore();
    const [isRecording, setIsRecording] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
    const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
    const [interimText, setInterimText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const isRecordingRef = useRef(false);
    const currentSpeakerRef = useRef<'doctor' | 'patient'>('doctor');
    const saveTimeoutRef = useRef<any>(null);
    const toast = useToast();

    // Fetch existing transcript on mount
    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const existing = await transcriptService.getByAppointment(appointmentId);
                if (existing && existing.transcript_text) {
                    // Start simple parsing of text back to lines if possible, or just raw text
                    // For now, assuming raw text needs to be parsed or just appended?
                    // Ideally backend stores JSON lines, but if text, let's try to parse:
                    // Format: [timestamp] Speaker: Text
                    const lines = existing.transcript_text.split('\n').map((line: string) => {
                        const match = line.match(/\[(.*?)\] (.*?): (.*)/);
                        if (match) {
                            return {
                                timestamp: match[1],
                                speaker: match[2].toLowerCase() === 'doctor' ? 'doctor' : 'patient',
                                text: match[3]
                            } as TranscriptLine;
                        }
                        return null;
                    }).filter(Boolean) as TranscriptLine[];

                    if (lines.length > 0) {
                        setTranscriptLines(lines);
                    }
                }
            } catch (error: any) {
                // 404 is expected if no transcript exists yet
                if (error.response?.status === 404) {
                    // console.log('No existing transcript found');
                } else {
                    console.error('Error fetching transcript:', error);
                }
            }
        };
        fetchTranscript();
    }, [appointmentId]);

    // Keep refs in sync with state
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        currentSpeakerRef.current = currentSpeaker;
    }, [currentSpeaker]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isRecording) return;

            // Only trigger if not typing in an input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            if (e.key.toLowerCase() === 'd') {
                setCurrentSpeaker('doctor');
                // toast.info('Speaker: Doctor', { duration: 1000 });
            } else if (e.key.toLowerCase() === 'p') {
                setCurrentSpeaker('patient');
                // toast.info('Speaker: Patient', { duration: 1000 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, toast]);

    // Auto-Save Logic (Debounced)
    const saveTranscriptToBackend = useCallback(async (lines: TranscriptLine[]) => {
        if (lines.length === 0) return;

        try {
            setIsSaving(true);
            const formattedTranscript = lines
                .map(line => `[${line.timestamp}] ${line.speaker === 'doctor' ? 'Doctor' : 'Patient'}: ${line.text}`)
                .join('\n');

            // Use passed doctorId/patientId or fallback to current user/defaults
            const dId = doctorId || user?.id || 'unknown';
            const pId = patientId || 'unknown';

            await transcriptService.save({
                appointment_id: appointmentId,
                doctor_id: dId,
                patient_id: pId,
                transcript_text: formattedTranscript
            });

            setLastSaved(new Date());
            if (onSaveTranscript) onSaveTranscript(formattedTranscript);
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [appointmentId, doctorId, patientId, user, onSaveTranscript]);

    // Trigger auto-save when lines change
    useEffect(() => {
        if (transcriptLines.length === 0) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveTranscriptToBackend(transcriptLines);
        }, 2000); // Auto-save 2 seconds after last change

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [transcriptLines, saveTranscriptToBackend]);


    // Initialize Speech Recognition ONCE on mount
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcriptPiece + ' ';
                } else {
                    interim += transcriptPiece;
                }
            }

            if (final.trim()) {
                setTranscriptLines(prev => [...prev, {
                    speaker: currentSpeakerRef.current,
                    text: final.trim(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }]);
                setInterimText('');
            }

            if (interim) {
                setInterimText(interim);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                toast.error('Microphone access denied');
            }
            if (event.error !== 'aborted') {
                // console.error('Speech recognition error:', event.error);
            }
            // Don't stop state immediately on non-critical errors to allow restart attempt
        };

        recognition.onend = () => {
            if (isRecordingRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // console.log('Mic restarted');
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Auto-scroll to bottom when transcript updates
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcriptLines, interimText]);

    const startRecording = () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not available');
            return;
        }

        try {
            recognitionRef.current.start();
            setIsRecording(true);
            toast.success('Recording started');
        } catch (error) {
            console.error('Failed to start recording:', error);
            // toast.error('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setInterimText('');
        toast.info('Recording stopped');
    };

    const handleDownload = () => {
        if (transcriptLines.length === 0) {
            toast.warning('No transcript to download');
            return;
        }

        const formattedTranscript = transcriptLines
            .map(line => `[${line.timestamp}] ${line.speaker === 'doctor' ? 'Doctor' : 'Patient'}: ${line.text}`)
            .join('\n');

        const blob = new Blob([formattedTranscript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-${appointmentId}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Transcript downloaded');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100 flex-shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                        <h3 className="font-semibold text-gray-900">Live Consultation</h3>
                        {lastSaved && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 ml-2 animate-fadeIn">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3 h-3 text-green-500" />
                                        Saved
                                    </>
                                )}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center shadow-sm ${isRecording
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                }`}
                        >
                            {isRecording ? (
                                <>
                                    <MicOff className="w-4 h-4 inline mr-2" />
                                    Stop Recording
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4 inline mr-2" />
                                    Start Recording
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={transcriptLines.length === 0}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            title="Download Transcript"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Speaker Toggle & Shortcuts Tip */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                                onClick={() => setCurrentSpeaker('doctor')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentSpeaker === 'doctor'
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500' // Visual highlight
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Stethoscope size={16} />
                                Doctor <span className="ml-1 text-[10px] opacity-60 bg-gray-200 px-1 rounded">D</span>
                            </button>
                            <button
                                onClick={() => setCurrentSpeaker('patient')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentSpeaker === 'patient'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-500' // Visual highlight
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <User size={16} />
                                Patient <span className="ml-1 text-[10px] opacity-60 bg-gray-200 px-1 rounded">P</span>
                            </button>
                        </div>
                    </div>

                    {isRecording && (
                        <div className="text-[10px] text-gray-500 bg-white/50 px-2 py-1 rounded border border-gray-200">
                            Press <strong>D</strong> or <strong>P</strong> to switch speakers
                        </div>
                    )}
                </div>
            </div>

            {/* Transcript Display - Chat Style */}
            <div
                ref={transcriptRef}
                className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 custom-scrollbar"
            >
                {transcriptLines.length > 0 || interimText ? (
                    <div className="space-y-4">
                        {transcriptLines.map((line, idx) => (
                            <div
                                key={idx}
                                className={`flex ${line.speaker === 'doctor' ? 'justify-start' : 'justify-end'} animate-slideUp`}
                            >
                                <div className={`max-w-[80%] ${line.speaker === 'doctor' ? 'mr-auto' : 'ml-auto'}`}>
                                    <div className={`flex items-end gap-2 mb-1 ${line.speaker === 'patient' ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${line.speaker === 'doctor' ? 'text-blue-600' : 'text-green-600'}`}>
                                            {line.speaker}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{line.timestamp}</span>
                                    </div>
                                    <div
                                        className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${line.speaker === 'doctor'
                                            ? 'bg-white text-gray-800 border border-blue-100 rounded-tl-none'
                                            : 'bg-green-600 text-white rounded-tr-none shadow-md'
                                            }`}
                                    >
                                        <p>{line.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {interimText && (
                            <div className={`flex ${currentSpeaker === 'doctor' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] ${currentSpeaker === 'doctor' ? 'mr-auto' : 'ml-auto'}`}>
                                    <div
                                        className={`p-3 rounded-2xl opacity-70 animate-pulse ${currentSpeaker === 'doctor'
                                            ? 'bg-gray-100 text-gray-600'
                                            : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        <p className="text-sm italic">{interimText}...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <Mic className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Ready to transcribe</p>
                        <p className="text-sm">Press Start to begin listening</p>
                    </div>
                )}
            </div>
        </div>
    );
};
