import { GoogleGenAI, Type } from "@google/genai";
import { VideoPlan, Scene } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVideoPlan = async (
  topic: string,
  includeVoice: boolean,
  includeSubtitles: boolean
): Promise<VideoPlan> => {
  
  const prompt = `
    You are an expert TikTok Video Architect. 
    Create a viral, engaging video plan about the topic: "${topic}".
    Target audience: Gen Z / Millennials. 
    Style: Fast-paced, informative, or entertaining.
    
    Requirements:
    - Total duration should be between 30-60 seconds.
    - Break it down into 3-6 distinct scenes.
    - Provide a title for the video.
    - For each scene, write the exact voice-over text (engaging hook, value, call to action).
    - For each scene, describe the visual prompt for an AI image generator (detailed, 9:16 aspect ratio description).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  voice_off_text: { type: Type.STRING },
                  visual_prompt: { type: Type.STRING },
                  estimated_duration: { type: Type.NUMBER, description: "Duration in seconds" },
                },
                required: ["voice_off_text", "visual_prompt", "estimated_duration"],
              },
            },
          },
          required: ["title", "scenes"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    
    // Add IDs for React keys
    const scenesWithIds = data.scenes.map((s: any, index: number) => ({
      ...s,
      id: index,
    }));

    return {
      title: data.title,
      scenes: scenesWithIds,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generatePreviewImage = async (prompt: string): Promise<string> => {
  // Using Gemini to generate a preview image for the frontend validation step
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002', // Using Imagen model for better visuals if available, otherwise fallback or handle error
      prompt: `${prompt}. High quality, photorealistic, TikTok vertical format style, 9:16 aspect ratio`,
      config: {
        numberOfImages: 1,
        aspectRatio: '9:16'
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64 = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64}`;
    }
    
    // Fallback if Imagen fails or not enabled: Use picsum
    return `https://picsum.photos/seed/${Math.random()}/1080/1920`;

  } catch (e) {
    // Fallback on error (likely model access)
    console.warn("Image generation failed, using placeholder", e);
    return `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0, 10)}/200/300`;
  }
};
