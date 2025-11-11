
import React, { useState, useRef, useCallback } from 'react';
import { generateImageForTravel, getTravelDetails, generateTravelAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Card } from './Card';
import { Loader } from './Loader';
import { GroundingSource } from '../types';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 15.858a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


export const TravelGuideGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [details, setDetails] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        setDetails(null);
        setAudioBuffer(null);
        setIsPlaying(false);

        try {
            const generatedImageUrl = await generateImageForTravel(prompt);
            setImageUrl(generatedImageUrl);

            const detailsResponse = await getTravelDetails(prompt);
            const groundingChunks = detailsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setDetails({ text: detailsResponse.text, sources: groundingChunks });
            
            if (detailsResponse.text) {
                const audioData = await generateTravelAudio(detailsResponse.text);
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const decodedBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                setAudioBuffer(decodedBuffer);
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleAudioPlayback = useCallback(() => {
        if (!audioBuffer || !audioContextRef.current) return;

        if (isPlaying) {
            audioSourceRef.current?.stop();
            setIsPlaying(false);
        } else {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
                audioSourceRef.current = null;
            };
            source.start();
            audioSourceRef.current = source;
            setIsPlaying(true);
        }
    }, [audioBuffer, isPlaying]);


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card title="Generate Your AI Travel Guide" icon={<SearchIcon/>}>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., The vibrant markets of Marrakech"
                        className="flex-grow w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </form>
                {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
            </Card>

            {(isLoading || imageUrl || details || audioBuffer) && (
                 <div className="space-y-6">
                    {isLoading && !imageUrl && <Loader text="Generating your amazing trip..." />}
                    
                    {imageUrl && (
                        <Card title="Your Destination" icon={<ImageIcon/>}>
                            <img src={imageUrl} alt={prompt} className="w-full h-auto object-cover rounded-lg shadow-md" />
                        </Card>
                    )}
                    
                    {details && (
                        <Card title="Travel Details" icon={<BookIcon/>}>
                            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: details.text.replace(/\n/g, '<br/>') }} />
                             {details.sources.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold text-md mb-2">Sources:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {details.sources.map((source, index) => source.web && (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    )}

                    {audioBuffer && (
                        <Card title="Audio Guide" icon={<AudioIcon/>}>
                            <div className="flex items-center space-x-4">
                               <button onClick={toggleAudioPlayback} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                   {isPlaying ? <PauseIcon/> : <PlayIcon/>}
                               </button>
                               <p className="text-slate-600 dark:text-slate-300">{isPlaying ? "Playing your audio guide..." : "Ready to play your audio guide!"}</p>
                            </div>
                        </Card>
                    )}
                 </div>
            )}
        </div>
    );
};
