import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { TopicExplanation } from '../types';

interface TopicCardProps {
  topicData: TopicExplanation;
  onGenerateQuiz?: (topic: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topicData, onGenerateQuiz }) => {
  return (
    <div className="mt-3 border border-cyan-500/30 rounded-2xl bg-slate-900/90 shadow-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/40 border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {topicData.topic}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                Deep Explainer
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Concept breakdown, analogies, mechanics & memory hooks</p>
          </div>
        </div>

        {onGenerateQuiz && (
          <button
            onClick={() => onGenerateQuiz(topicData.topic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition self-start sm:self-auto font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quiz me on this</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Core Intuition */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Core Intuition</span>
          <p className="text-slate-200 text-xs leading-relaxed font-medium">{topicData.coreIntuition}</p>
        </div>

        {/* Real-World Analogy Spotlight */}
        {topicData.realWorldAnalogy && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Real-World Analogy: Why it works</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs italic">
              "{topicData.realWorldAnalogy}"
            </p>
          </div>
        )}

        {/* Formal Technical Breakdown */}
        {topicData.formalBreakdown && topicData.formalBreakdown.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2 text-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technical Mechanics & Components</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {topicData.formalBreakdown.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    {item.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
                  {item.equationsOrMechanisms && item.equationsOrMechanisms.length > 0 && (
                    <div className="pt-1">
                      {item.equationsOrMechanisms.map((eq, eqIdx) => (
                        <div key={eqIdx} className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-300 overflow-x-auto">
                          {eq}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Guide */}
        {topicData.stepByStepGuide && topicData.stepByStepGuide.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step-by-Step Execution Sequence</span>
            </span>
            <div className="space-y-1.5">
              {topicData.stepByStepGuide.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-indigo-400 font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Misconceptions Buster */}
        {topicData.commonMisconceptions && topicData.commonMisconceptions.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Common Pitfalls & Misconceptions</span>
            </div>
            <div className="space-y-2 text-[11px]">
              {topicData.commonMisconceptions.map((m, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <p className="text-rose-300 font-medium flex items-center gap-1">
                    <span>✗ Common Mistake:</span> {m.misconception}
                  </p>
                  <p className="text-emerald-300 flex items-center gap-1">
                    <span>✓ Academic Reality:</span> {m.correction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cheat Sheet Summary */}
        {topicData.cheatSheetSummary && (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5">
            <Bookmark className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 text-xs">Revision Memory Hook:</span>
              <p className="text-slate-200 text-xs leading-relaxed mt-0.5">{topicData.cheatSheetSummary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
