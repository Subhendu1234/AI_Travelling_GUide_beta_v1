
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateImageForTravel = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error('Image generation failed or returned no image data.');
};


export const getTravelDetails = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    const detailedPrompt = `Provide a fun and engaging travel guide for "${prompt}". Include history, top attractions, local cuisine, and tips for visitors.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: detailedPrompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    return response;
};

export const generateTravelAudio = async (text: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error('Audio generation failed.');
    }
    return base64Audio;
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error('Image editing failed or returned no image data.');
};
