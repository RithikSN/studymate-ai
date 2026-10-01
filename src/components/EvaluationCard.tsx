import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Award,
  BarChart3
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface EvaluationCardProps {
  evaluation: EvaluationResult;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation }) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 7.0) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 5.0) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const criteria = [
    { label: 'Concept Accuracy', score: evaluation.criteriaScores.accuracy, max: 10 },
    { label: 'Completeness', score: evaluation.criteriaScores.completeness, max: 10 },
    { label: 'Technical Clarity', score: evaluation.criteriaScores.clarity, max: 10 },
    { label: 'Logical Reasoning', score: evaluation.criteriaScores.reasoning, max: 10 },
  ];

  return (
    <div className="mt-3 border border-purple-500/30 rounded-2xl bg-slate-900/90 shadow-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border-b border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Academic Answer Evaluation
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-500/25 text-purple-200 border border-purple-400/30">
                {evaluation.gradeBadge}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Graded against academic rubric & gold-standard criteria</p>
          </div>
        </div>

        {/* Big Score Box */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 self-start sm:self-auto ${getScoreColor(evaluation.overallScore)}`}>
          <span className="text-2xl font-black">{evaluation.overallScore}</span>
          <div className="text-[10px] text-slate-300 flex flex-col leading-tight">
            <span>OUT OF</span>
            <span className="font-bold text-white">10.0</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Rubric Criteria Grid */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Rubric Breakdown</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {criteria.map((c, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">{c.label}</span>
                  <span className="font-bold text-white font-mono">{c.score}/{c.max}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                    style={{ width: `${(c.score / c.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses 2-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Strengths */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Key Strengths</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-400">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses / Gaps */}
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Gaps & Misconceptions</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {evaluation.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-rose-400">✗</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Suggestions */}
        {evaluation.actionableSuggestions && evaluation.actionableSuggestions.length > 0 && (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Actionable Recommendations for Top Marks</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-300">
              {evaluation.actionableSuggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span className="leading-snug">{sug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exemplary Model Answer Toggle */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-slate-200">
                {showModelAnswer ? 'Hide Exemplary Model Answer' : 'View Exemplary Model Answer (Gold Standard)'}
              </span>
            </div>
            {showModelAnswer ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showModelAnswer && (
            <div className="p-4 border-t border-slate-850 bg-slate-950 text-slate-200 leading-relaxed text-[11px] font-sans whitespace-pre-line border-l-2 border-l-purple-500">
              {evaluation.modelAnswer}
            </div>
          )}
        </div>

        {/* Evaluator Professor Notes */}
        {evaluation.evaluatorNotes && (
          <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
            💬 <strong>Professor’s Note:</strong> {evaluation.evaluatorNotes}
          </p>
        )}
      </div>
    </div>
  );
};
