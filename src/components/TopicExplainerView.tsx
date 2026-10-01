import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Lightbulb, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sliders,
  HelpCircle
} from 'lucide-react';
import { TopicExplanation, UserProfile } from '../types';
import { TopicCard } from './TopicCard';

interface TopicExplainerViewProps {
  onExplain: (topic: string) => Promise<TopicExplanation | null>;
  isExplaining: boolean;
  profile: UserProfile;
  onNavigateToQuiz?: (topic: string) => void;
}

export const TopicExplainerView: React.FC<TopicExplainerViewProps> = ({
  onExplain,
  isExplaining,
  profile,
  onNavigateToQuiz
}) => {
  const [topicInput, setTopicInput] = useState('Scaled Dot-Product Attention in Transformers');
  const [topicData, setTopicData] = useState<TopicExplanation | null>(null);

  const presets = [
    'Scaled Dot-Product Attention in Transformers',
    'Virtual Memory & Translation Lookaside Buffer (TLB)',
    'Banker’s Algorithm for Deadlock Avoidance',
    'Mitchell’s Chemiosmotic Hypothesis & ATP Synthase',
    'Backpropagation & Gradient Descent in Neural Networks',
    'TCP Three-Way Handshake & Congestion Control'
  ];

  const handleRunExplain = async (topicToUse?: string) => {
    const t = topicToUse || topicInput;
    if (!t.trim()) return;
    const res = await onExplain(t.trim());
    if (res) {
      setTopicData(res);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Multi-Layered Concept Explainer
            </h2>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Break down complex theories into intuitive real-world analogies, rigorous mathematical mechanics, 
            step-by-step logic, and common misconceptions.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {presets.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopicInput(p);
                handleRunExplain(p);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition"
            >
              {p.split(' in ')[0].split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3 text-xs">
        <label className="block text-slate-300 font-semibold">Enter Any Concept, Algorithm, or Academic Theory</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Backpropagation, Paging vs Segmentation, Krebs Cycle..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
          />
          <button
            onClick={() => handleRunExplain()}
            disabled={isExplaining || !topicInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            {isExplaining ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Explain Concept</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Topic Card */}
      {topicData && (
        <TopicCard
          topicData={topicData}
          onGenerateQuiz={onNavigateToQuiz}
        />
      )}

    </div>
  );
};
