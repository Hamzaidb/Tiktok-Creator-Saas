import React, { useState } from 'react';
import { VideoPlan, PYTHON_BACKEND_CODE } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Code, Play, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResultStageProps {
  plan: VideoPlan;
  onReset: () => void;
}

export const ResultStage: React.FC<ResultStageProps> = ({ plan, onReset }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Pipeline Completed</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{plan.title}</h2>
        <p className="text-muted-foreground">Your assets are ready for assembly.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-secondary/50 p-1 rounded-lg flex">
            <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Preview Assets
            </button>
            <button
                onClick={() => setActiveTab('code')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" /> Backend Logic
                </div>
            </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Video Player / Assembly Preview */}
            <div className="lg:col-span-1 row-span-2">
                 <div className="sticky top-6">
                    <div className="aspect-[9/16] bg-black rounded-xl border border-white/10 overflow-hidden relative shadow-2xl shadow-indigo-500/10 group">
                        {/* Show the first generated image if available */}
                        {plan.scenes[0]?.generated_image_url ? (
                             <img src={plan.scenes[0].generated_image_url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                <span className="text-neutral-600">Preview</span>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                <Play className="w-8 h-8 fill-white text-white ml-1" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                            <p className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">
                                {plan.scenes[0]?.voice_off_text.substring(0, 50)}...
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                         <Button className="w-full" variant="outline">
                            <Download className="mr-2 w-4 h-4" /> Download MP4
                         </Button>
                    </div>
                 </div>
            </div>

            {/* Asset Breakdown */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-400 text-sm">Architecture Note</h4>
                        <p className="text-xs text-blue-200/70 mt-1">
                            Since this is a browser-based demo, we mocked the final FFmpeg/MoviePy assembly. 
                            In production, the JSON payload below is sent to the FastAPI backend (see 'Backend Logic' tab) 
                            to generate the real MP4 file.
                        </p>
                    </div>
                </div>

                <h3 className="font-bold text-xl">Generated Scenes Breakdown</h3>
                <div className="space-y-4">
                    {plan.scenes.map((scene, i) => (
                        <Card key={i} className="flex gap-4 p-4 overflow-hidden">
                            <div className="w-24 h-32 bg-neutral-800 rounded-md shrink-0 overflow-hidden">
                                {scene.generated_image_url ? (
                                    <img src={scene.generated_image_url} className="w-full h-full object-cover" alt={`Scene ${i}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground">Scene {i + 1}</h4>
                                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">{scene.estimated_duration}s</span>
                                </div>
                                <p className="text-sm mb-2 font-medium">"{scene.voice_off_text}"</p>
                                <p className="text-xs text-muted-foreground truncate font-mono">{scene.visual_prompt}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      ) : (
        <div className="w-full">
             <Card className="bg-[#1e1e1e] border-neutral-800">
                <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-mono text-muted-foreground">backend/main.py</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(PYTHON_BACKEND_CODE)}>
                        Copy Code
                    </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <pre className="p-4 text-sm font-mono text-blue-100 leading-relaxed">
                        <code>{PYTHON_BACKEND_CODE}</code>
                    </pre>
                </CardContent>
             </Card>
        </div>
      )}
      
      <div className="mt-12 text-center">
        <Button onClick={onReset} variant="secondary">Create Another Video</Button>
      </div>
    </div>
  );
};