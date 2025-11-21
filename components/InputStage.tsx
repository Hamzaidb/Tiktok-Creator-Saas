import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { GenerationOptions } from '../types';
import { Wand2, Mic, Type as TypeIcon } from 'lucide-react';

interface InputStageProps {
  onSubmit: (options: GenerationOptions) => void;
  isLoading: boolean;
}

export const InputStage: React.FC<InputStageProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [includeVoice, setIncludeVoice] = useState(true);
  const [includeSubtitles, setIncludeSubtitles] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({ topic, includeVoice, includeSubtitles });
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          TikTok AI Architect
        </h1>
        <p className="text-muted-foreground">
          Turn an idea into a viral video plan in seconds.
        </p>
      </div>

      <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>What do you want to create?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Prompt / Theme
              </label>
              <textarea
                id="topic"
                placeholder="e.g., '5 facts about space that will blow your mind' or 'A funny skit about remote work'"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setIncludeVoice(!includeVoice)}
                className={`cursor-pointer border rounded-md p-4 flex items-center justify-between transition-all ${includeVoice ? 'bg-secondary border-primary/50' : 'bg-background border-input'}`}
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Voiceover</span>
                </div>
                <div className={`w-4 h-4 rounded-full border ${includeVoice ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
              </div>

              <div 
                onClick={() => setIncludeSubtitles(!includeSubtitles)}
                className={`cursor-pointer border rounded-md p-4 flex items-center justify-between transition-all ${includeSubtitles ? 'bg-secondary border-primary/50' : 'bg-background border-input'}`}
              >
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Subtitles</span>
                </div>
                <div className={`w-4 h-4 rounded-full border ${includeSubtitles ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold h-12" disabled={isLoading || !topic}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Dreaming up ideas...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate Plan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};