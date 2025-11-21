export interface Scene {
  id: number;
  voice_off_text: string;
  visual_prompt: string;
  estimated_duration: number; // in seconds
  generated_image_url?: string; // Placeholder for frontend preview
}

export interface VideoPlan {
  title: string;
  scenes: Scene[];
}

export enum AppState {
  INPUT = 'INPUT',
  GENERATING_PLAN = 'GENERATING_PLAN',
  REVIEW = 'REVIEW',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  SUCCESS = 'SUCCESS',
}

export interface GenerationOptions {
  topic: string;
  includeVoice: boolean;
  includeSubtitles: boolean;
}

// This is for the Simulated Backend Code View
export const PYTHON_BACKEND_CODE = `
import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from moviepy.editor import (
    ImageClip, 
    AudioFileClip, 
    CompositeVideoClip, 
    TextClip, 
    concatenate_videoclips
)
# Note: In a real env, you'd use OpenAI or ElevenLabs SDKs
# import openai 

app = FastAPI()

class Scene(BaseModel):
    voice_off_text: string
    visual_prompt: string
    estimated_duration: float

class VideoRequest(BaseModel):
    scenes: List[Scene]
    include_voice: bool = True
    include_subtitles: bool = True

async def generate_audio(text: str, output_path: str):
    """
    Mock function: Call TTS API (OpenAI/ElevenLabs) here.
    """
    # response = client.audio.speech.create(...)
    # with open(output_path, "wb") as f: f.write(response.content)
    pass

async def generate_image(prompt: str, output_path: str):
    """
    Mock function: Call Image Gen API (DALL-E 3/Stable Diffusion).
    """
    # response = client.images.generate(...)
    # image_url = response.data[0].url
    # download_image(image_url, output_path)
    pass

def process_video_pipeline(request: VideoRequest, job_id: str):
    """
    Heavy lifting with MoviePy.
    """
    clips = []
    base_dir = f"./temp/{job_id}"
    os.makedirs(base_dir, exist_ok=True)

    for i, scene in enumerate(request.scenes):
        # 1. Generate Assets
        audio_path = f"{base_dir}/scene_{i}.mp3"
        image_path = f"{base_dir}/scene_{i}.png"
        
        # In async context, you'd await these or run in threadpool
        # generate_audio(scene.voice_off_text, audio_path)
        # generate_image(scene.visual_prompt, image_path)
        
        # 2. Create Clips
        # Load Audio
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration
        
        # Load Image & Set Duration
        img_clip = ImageClip(image_path).set_duration(duration)
        
        # Resize for 9:16 (TikTok vertical) - simplified logic
        img_clip = img_clip.resize(height=1920)
        img_clip = img_clip.crop(x1=0, y1=0, width=1080, height=1920, x_center=img_clip.w/2, y_center=img_clip.h/2)
        
        final_scene_clip = img_clip.set_audio(audio_clip)

        # 3. Add Subtitles (Burn-in)
        if request.include_subtitles:
            txt_clip = TextClip(
                scene.voice_off_text, 
                fontsize=70, 
                color='white', 
                font='Arial-Bold',
                stroke_color='black',
                stroke_width=2,
                size=(1000, None), 
                method='caption'
            ).set_pos(('center', 'bottom')).set_duration(duration)
            
            final_scene_clip = CompositeVideoClip([final_scene_clip, txt_clip])
        
        clips.append(final_scene_clip)

    # 4. Concatenate
    final_video = concatenate_videoclips(clips)
    output_filename = f"output_{job_id}.mp4"
    final_video.write_videofile(output_filename, fps=24, codec="libx264")
    
    return output_filename

@app.post("/generate-video")
async def generate_video_endpoint(request: VideoRequest, background_tasks: BackgroundTasks):
    job_id = os.urandom(4).hex()
    
    # Offload heavy processing
    background_tasks.add_task(process_video_pipeline, request, job_id)
    
    return {"status": "processing", "job_id": job_id, "message": "Video generation started"}
`;
