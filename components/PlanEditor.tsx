import React from 'react';
import { VideoPlan, Scene } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Trash2, Plus, Video, Clock, Image as ImageIcon } from 'lucide-react';

interface PlanEditorProps {
  plan: VideoPlan;
  onUpdatePlan: (plan: VideoPlan) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onUpdatePlan, onConfirm, isProcessing }) => {
  
  const handleSceneChange = (id: number, field: keyof Scene, value: string | number) => {
    const updatedScenes = plan.scenes.map(scene => 
      scene.id === id ? { ...scene, [field]: value } : scene
    );
    onUpdatePlan({ ...plan, scenes: updatedScenes });
  };

  const deleteScene = (id: number) => {
    onUpdatePlan({ ...plan, scenes: plan.scenes.filter(s => s.id !== id) });
  };

  const addScene = () => {
    const newId = Math.max(...plan.scenes.map(s => s.id), 0) + 1;
    const newScene: Scene = {
      id: newId,
      voice_off_text: "New scene voiceover...",
      visual_prompt: "Description of visuals...",
      estimated_duration: 5
    };
    onUpdatePlan({ ...plan, scenes: [...plan.scenes, newScene] });
  };

  const totalDuration = plan.scenes.reduce((acc, s) => acc + (Number(s.estimated_duration) || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold">Review Your Plan</h2>
            <p className="text-muted-foreground text-sm">Edit the script and visual prompts before generation.</p>
        </div>
        <div className="flex items-center gap-4 bg-secondary/50 px-4 py-2 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-sm font-bold">{totalDuration}s Est. Duration</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-1 block">Video Title</label>
        <input 
            value={plan.title}
            onChange={(e) => onUpdatePlan({...plan, title: e.target.value})}
            className="w-full bg-transparent text-3xl font-bold border-b border-white/20 focus:border-indigo-500 outline-none py-2"
        />
      </div>

      <div className="space-y-6">
        {plan.scenes.map((scene, index) => (
          <Card key={scene.id} className="group relative border-l-4 border-l-indigo-500 bg-card/50 hover:bg-card transition-all">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="destructive" onClick={() => deleteScene(scene.id)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Scene {index + 1}</span>
                    <input
                        type="number"
                        className="w-16 bg-background border rounded px-2 py-1 text-xs text-right"
                        value={scene.estimated_duration}
                        onChange={(e) => handleSceneChange(scene.id, 'estimated_duration', parseInt(e.target.value))}
                    />
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Video className="w-3 h-3" /> Script / Voiceover
                    </label>
                    <textarea
                        className="w-full min-h-[100px] bg-secondary/30 rounded p-3 text-sm border border-transparent focus:border-indigo-500 outline-none resize-none"
                        value={scene.voice_off_text}
                        onChange={(e) => handleSceneChange(scene.id, 'voice_off_text', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <ImageIcon className="w-3 h-3" /> Visual Prompt (AI Image Gen)
                    </label>
                    <textarea
                        className="w-full min-h-[100px] bg-secondary/30 rounded p-3 text-sm border border-transparent focus:border-purple-500 outline-none resize-none font-mono text-xs text-purple-200/80"
                        value={scene.visual_prompt}
                        onChange={(e) => handleSceneChange(scene.id, 'visual_prompt', e.target.value)}
                    />
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
         <Button variant="secondary" onClick={addScene} className="w-full md:w-auto border border-dashed border-white/20">
            <Plus className="mr-2 h-4 w-4" /> Add Scene
         </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t border-white/10 flex justify-center z-50">
        <Button onClick={onConfirm} size="lg" className="w-full max-w-md shadow-lg shadow-indigo-500/20" disabled={isProcessing}>
            {isProcessing ? "Generating Assets..." : "Validate & Generate Video"}
        </Button>
      </div>
    </div>
  );
};