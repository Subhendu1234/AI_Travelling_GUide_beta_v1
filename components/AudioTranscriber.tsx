
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Card } from './Card';
import { encode } from '../utils/audioUtils';

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v4m0 0H9m4 0h2m-4-8a4 4 0 014 4v2a4 4 0 01-8 0v-2a4 4 0 014-4z" /></svg>;

export const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const startRecording = async () => {
        try {
            setTranscription('');
            setError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened.');
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                             setTranscription(prev => prev + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('A connection error occurred.');
                        stopRecording();
                    },
                    onclose: () => {
                        console.log('Live session closed.');
                    },
                },
                config: {
                    inputAudioTranscription: {},
                },
            });
            
            sessionPromise.then((session) => {
                sessionRef.current = session;
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = inputAudioContext;

                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = scriptProcessor;

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        int16[i] = inputData[i] * 32768;
                    }
                    const pcmBlob: Blob = {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };

                    if(sessionRef.current) {
                        sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                    }
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            });

            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card title="Live Audio Transcription" icon={<MicIcon/>}>
                <div className="text-center space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        {isRecording ? "Recording... Click to stop." : "Click the button and start speaking."}
                    </p>
                    <button
                        onClick={handleToggleRecording}
                        className={`px-8 py-4 font-bold text-white rounded-full transition-all duration-300 transform hover:scale-105 ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isRecording ? 'Stop Transcribing' : 'Start Transcribing'}
                    </button>
                    {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
                </div>
            </Card>
            {(transcription) && (
                 <Card title="Your Transcription">
                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{transcription}</p>
                 </Card>
            )}
        </div>
    );
};
