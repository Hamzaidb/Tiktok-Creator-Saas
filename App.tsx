import React, { useState } from 'react';
import { InputStage } from './components/InputStage';
import { PlanEditor } from './components/PlanEditor';
import { ResultStage } from './components/ResultStage';
import { AppState, VideoPlan, GenerationOptions } from './types';
import { generateVideoPlan } from './services/geminiService'; // generatePreviewImage n'est plus utilisé ici
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [plan, setPlan] = useState<VideoPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- CORRECTION : ON DÉCLARE LA VARIABLE MANQUANTE ICI ---
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleInputSubmit = async (options: GenerationOptions) => {
    setIsLoading(true);
    setAppState(AppState.GENERATING_PLAN);
    try {
      const generatedPlan = await generateVideoPlan(
        options.topic,
        options.includeVoice,
        options.includeSubtitles
      );
      setPlan(generatedPlan);
      setAppState(AppState.REVIEW);
    } catch (error) {
      console.error(error);
      setAppState(AppState.INPUT);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanUpdate = (updatedPlan: VideoPlan) => {
    setPlan(updatedPlan);
  };

  const handleConfirmPlan = async () => {
    if (!plan) return;
    setIsLoading(true);
    setAppState(AppState.GENERATING_VIDEO);

    try {
      const videoRequest = {
        scenes: plan.scenes,
        include_voice: true,
        include_subtitles: true
      };

      // On attend la réponse du Python (ça peut prendre 10-15 secondes)
      const response = await fetch('http://127.0.0.1:8000/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoRequest),
      });

      const data = await response.json();
      
      if (data.video_url) {
        setVideoUrl(data.video_url); // Maintenant cette ligne fonctionne !
        setAppState(AppState.SUCCESS);
      }

    } catch (error) {
        console.error(error);
        alert("Erreur lors de la création de la vidéo");
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setVideoUrl(null); // On remet aussi la vidéo à zéro
    setAppState(AppState.INPUT);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                AI
            </div>
            <span>TikTok<span className="text-indigo-400">Architect</span></span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            MVP v0.1
          </div>
        </header>

        <main>
            {appState === AppState.INPUT && (
                <InputStage onSubmit={handleInputSubmit} isLoading={isLoading} />
            )}

            {appState === AppState.GENERATING_PLAN && (
                 <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in duration-500">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <h3 className="text-xl font-medium">Consulting the Algorithm...</h3>
                    <p className="text-muted-foreground">Structuring your viral hit.</p>
                 </div>
            )}

            {appState === AppState.REVIEW && plan && (
                <PlanEditor 
                    plan={plan} 
                    onUpdatePlan={handlePlanUpdate} 
                    onConfirm={handleConfirmPlan}
                    isProcessing={isLoading}
                />
            )}

             {appState === AppState.GENERATING_VIDEO && (
                 <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">AI</div>
                    </div>
                    <h3 className="text-xl font-medium">Generating Assets</h3>
                    <p className="text-muted-foreground max-w-md text-center">
                        Creating visuals with Imagen, synthesizing voiceovers, and simulating backend assembly...
                    </p>
                 </div>
            )}

            {appState === AppState.SUCCESS && plan && (
                <ResultStage plan={plan} onReset={handleReset} videoUrl={videoUrl} />
            )}
        </main>
      </div>
    </div>
  );
};

export default App;