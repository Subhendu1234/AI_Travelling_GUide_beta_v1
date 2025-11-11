
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Card } from './Card';
import { Loader } from './Loader';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;


export const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [originalImage, setOriginalImage] = useState<{ file: File, base64Url: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setEditedImage(null);
            setOriginalImage({ file, base64Url: URL.createObjectURL(file) });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !originalImage) return;
        
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        
        try {
            const base64Data = await fileToBase64(originalImage.file);
            const mimeType = originalImage.file.type;
            const resultUrl = await editImage(base64Data, mimeType, prompt);
            setEditedImage(resultUrl);
        } catch (err: any) {
            setError(err.message || 'Failed to edit image.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card title="AI Image Editor" icon={<EditIcon/>}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <label htmlFor="file-upload" className="w-full cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg inline-flex items-center justify-center transition-colors">
                        <UploadIcon/>
                        <span>{originalImage ? 'Change Image' : 'Upload an Image'}</span>
                     </label>
                     <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter, make it winter"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={isLoading || !originalImage}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || !originalImage}
                        className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoading ? 'Editing...' : 'Apply Edit'}
                    </button>
                </form>
                {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
            </Card>

            {(originalImage || editedImage || isLoading) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {originalImage && (
                        <Card title="Original" className="h-full">
                            <img src={originalImage.base64Url} alt="Original user upload" className="w-full h-auto object-contain rounded-lg" />
                        </Card>
                    )}
                    <Card title="Edited" className="h-full">
                        {isLoading && <Loader text="Applying AI magic..." />}
                        {editedImage && <img src={editedImage} alt="AI edited result" className="w-full h-auto object-contain rounded-lg" />}
                        {!isLoading && !editedImage && originalImage && <div className="text-center p-8 text-slate-500">Your edited image will appear here.</div>}
                    </Card>
                </div>
            )}
        </div>
    );
};
