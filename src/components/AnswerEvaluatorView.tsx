import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Award, 
  Sliders, 
  BookOpen, 
  FileText,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { EvaluationResult, UserProfile } from '../types';
import { EvaluationCard } from './EvaluationCard';

interface AnswerEvaluatorViewProps {
  onEvaluate: (question: string, answer: string) => Promise<EvaluationResult | null>;
  isEvaluating: boolean;
  profile: UserProfile;
}

export const AnswerEvaluatorView: React.FC<AnswerEvaluatorViewProps> = ({
  onEvaluate,
  isEvaluating,
  profile
}) => {
  const [question, setQuestion] = useState(
    'Why does Quicksort exhibit an O(n^2) worst-case time complexity, and how do modern implementations mitigate this risk?'
  );
  const [studentAnswer, setStudentAnswer] = useState(
    'Quicksort takes O(n^2) when the array is already sorted or when the chosen pivot happens to be the smallest or biggest number every time. This creates unbalanced partitions of size 0 and n-1. In modern code, people use random pivot selection or median-of-three to pick a better pivot and avoid the worst case.'
  );

  const [result, setResult] = useState<EvaluationResult | null>(null);

  const samplePrompts = [
    {
      q: 'Explain why the dot product in Transformer Attention is scaled by the square root of d_k.',
      a: 'If d_k is large, the dot products grow large in magnitude, which pushes the softmax function into regions with extremely small gradients, leading to vanishing gradients. Dividing by sqrt(d_k) normalizes the variance to 1.'
    },
    {
      q: 'Describe the role of the proton-motive force in mitochondrial ATP synthesis during chemiosmosis.',
      a: 'The electron transport chain pumps hydrogen ions across the inner membrane into the intermembrane space. This creates a concentration gradient. The protons then rush back through ATP synthase, spinning it like a turbine to make ATP from ADP and phosphate.'
    },
    {
      q: 'What is a Translation Lookaside Buffer (TLB) and what happens on a TLB miss?',
      a: 'A TLB is a cache that stores page numbers. On a hit it gives the address. On a miss, it goes to RAM, finds the page table, translates it, updates the cache, and restarts the instruction.'
    }
  ];

  const handleRunEvaluation = async () => {
    if (!question.trim() || !studentAnswer.trim()) return;
    const res = await onEvaluate(question, studentAnswer);
    if (res) {
      setResult(res);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/40 border border-purple-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Academic Answer Evaluator & Rubric Grader
            </h2>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Submit your drafted exam or homework responses for rigorous academic evaluation. 
            Receive criteria-based grading (Accuracy, Completeness, Clarity, Reasoning), actionable gap analysis, and a gold-standard model answer.
          </p>
        </div>

        {/* Quick test presets */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(p.q);
                setStudentAnswer(p.a);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950 border border-slate-700/60 text-slate-300 hover:text-purple-300 transition"
            >
              Preset #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Input Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Exam / Homework Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="Paste the question or problem prompt..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-medium resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Your Drafted Answer</label>
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={5}
            placeholder="Type or paste your response here..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            Grading Standard: <strong className="text-slate-200">{profile.gradeLevel}</strong> Academic Rubric
          </span>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating || !question.trim() || !studentAnswer.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating Rubric...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Evaluate My Answer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Evaluation Result */}
      {result && (
        <EvaluationCard evaluation={result} />
      )}

    </div>
  );
};
