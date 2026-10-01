import React, { useState } from 'react';
import { 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Crosshair,
  Zap,
  HelpCircle
} from 'lucide-react';
import { AgentThought } from '../types';

interface AgentThoughtDrawerProps {
  thought: AgentThought;
}

export const AgentThoughtDrawer: React.FC<AgentThoughtDrawerProps> = ({ thought }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'rag_document_qa':
        return 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30';
      case 'quiz_generate':
        return 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30';
      case 'study_plan':
        return 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30';
      case 'answer_evaluate':
        return 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30';
      case 'topic_explain':
        return 'from-cyan-500/20 to-sky-500/20 text-cyan-300 border-cyan-500/30';
      case 'web_search':
        return 'from-rose-500/20 to-orange-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'from-slate-500/20 to-slate-600/20 text-slate-300 border-slate-600/30';
    }
  };

  const getToolDisplayName = (tool: string) => {
    switch (tool) {
      case 'rag_document_qa': return 'TF-IDF Document RAG';
      case 'quiz_generate': return 'Interactive Quiz Generator';
      case 'study_plan': return 'Personalized Study Planner';
      case 'answer_evaluate': return 'Academic Rubric Evaluator';
      case 'topic_explain': return 'Deep Concept Explainer';
      case 'web_search': return 'Web Grounding Retrieval';
      default: return 'General Educational Tutor';
    }
  };

  const confidencePercent = Math.round((thought.confidence || 0.9) * 100);

  return (
    <div className="my-2 border border-slate-700/60 rounded-xl bg-slate-900/70 overflow-hidden shadow-sm backdrop-blur-sm">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 border border-indigo-400/30 text-indigo-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Agent Reasoning</span>
          </div>

          <div className={`px-2 py-0.5 rounded-full text-[11px] font-medium border bg-gradient-to-r ${getToolColor(thought.selectedTool)}`}>
            {getToolDisplayName(thought.selectedTool)}
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Intent: <strong className="text-slate-200">{thought.intent}</strong>
          </span>

          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {confidencePercent}% conf
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span className="text-[11px] hidden md:inline">{isOpen ? 'Hide chain' : 'Inspect thought process'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded reasoning details */}
      {isOpen && (
        <div className="px-4 py-3.5 border-t border-slate-800 bg-slate-950/60 space-y-3 text-xs">
          
          {/* Rationale */}
          <div>
            <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cognitive Rationale</span>
            </div>
            <p className="text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
              {thought.rationale}
            </p>
          </div>

          {/* Execution Pipeline Steps */}
          {thought.steps && thought.steps.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Pipeline</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {thought.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-300 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Parameters */}
          {thought.parameters && Object.keys(thought.parameters).length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-850 text-[11px] text-slate-400">
              <Crosshair className="w-3 h-3 text-indigo-400" />
              <span>Extracted Parameters:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(thought.parameters).map(([key, val]) => (
                  <span key={key} className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono text-[10px]">
                    {key}: <span className="text-indigo-300 font-semibold">{String(val)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
