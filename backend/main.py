import os
import requests
import urllib.parse # Pour encoder le prompt dans l'URL
from typing import List
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import time

# --- IMPORTS MOVIEPY V2 ---
from moviepy import ImageClip, TextClip, ColorClip, CompositeVideoClip, concatenate_videoclips
from moviepy.video.fx import Resize, Crop

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("outputs", exist_ok=True)
os.makedirs("temp_images", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

class Scene(BaseModel):
    voice_off_text: str
    visual_prompt: str
    estimated_duration: float

class VideoRequest(BaseModel):
    scenes: List[Scene]
    include_voice: bool = True
    include_subtitles: bool = True

def generate_image_pollinations(prompt: str, output_path: str):
    """
    Génère une image via Pollinations.ai avec Retry et Timeout allongé.
    """
    print(f"🎨 Génération Pollinations pour : {prompt[:20]}...")

    # On encode le prompt
    encoded_prompt = urllib.parse.quote(f"{prompt}, vertical, 9:16, 4k, photorealistic, cinematic lighting")
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1080&height=1920&model=flux&nologo=true"

    # ON TENTE 3 FOIS AVANT D'ABANDONNER
    for attempt in range(1, 4):
        try:
            # On augmente le timeout à 60 secondes (les modèles gratuits sont parfois lents)
            response = requests.get(url, timeout=60)

            if response.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Image IA générée ! (Succès au tour {attempt})")
                return True
            else:
                print(f"⚠️ Erreur API ({response.status_code})... On retente.")

        except Exception as e:
            print(f"⏳ Timeout ou erreur réseau (Essai {attempt}/3)... On attend un peu.")
            time.sleep(2) # Petite pause avant de réessayer

    # Si après 3 essais ça rate toujours, on passe au Plan B
    print("❌ Échec définitif Pollinations. Passage au Plan B.")
    return download_placeholder(prompt, output_path)
def download_placeholder(prompt: str, output_path: str):
    """Plan B : Image aléatoire Picsum"""
    try:
        print("🔄 Plan B : Image Placeholder...")
        seed = abs(hash(prompt)) % 1000
        url = f"https://picsum.photos/seed/{seed}/1080/1920"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return True
    except Exception:
        pass
    return False

@app.post("/generate-video")
async def generate_video_endpoint(request: VideoRequest):
    job_id = os.urandom(4).hex()
    clips = []
    
    for i, scene in enumerate(request.scenes):
        duration = 5.0 
        image_filename = f"temp_images/{job_id}_scene_{i}.png"
        
        # --- APPEL POLLINATIONS ---
        success = generate_image_pollinations(scene.visual_prompt, image_filename)
        
        if success:
            img_clip = ImageClip(image_filename).with_duration(duration)
            # Redimensionnement de sécurité
            img_clip = img_clip.with_effects([
                Resize(height=1920),
                Crop(width=1080, height=1920, x_center=1080/2, y_center=1920/2)
            ])
        else:
            img_clip = ColorClip(size=(1080, 1920), color=(50, 50, 50), duration=duration)

        # Sous-titres
        try:
            if request.include_subtitles:
                txt_clip = TextClip(
                    text=scene.voice_off_text, 
                    font_size=60, 
                    color='white', 
                    font=r'C:\Windows\Fonts\arial.ttf', 
                    stroke_color='black',
                    stroke_width=3,
                    method='caption',
                    size=(900, None)
                ).with_position('center').with_duration(duration)
                img_clip = CompositeVideoClip([img_clip, txt_clip])
        except Exception as e:
            print(f"Erreur sous-titres : {e}")

        clips.append(img_clip)

    if clips:
        final_video = concatenate_videoclips(clips)
        output_filename = f"outputs/video_{job_id}.mp4"
        final_video.write_videofile(output_filename, fps=24, codec="libx264", preset="ultrafast")
        
        return {
            "status": "done", 
            "video_url": f"http://127.0.0.1:8000/{output_filename}"
        }
    
    return {"status": "error", "message": "No clips generated"}