import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz } from '../types';

interface InteractiveQuizCardProps {
  quiz: Quiz;
  onOpenArena?: (quiz: Quiz) => void;
  onComplete?: (score: number, total: number) => void;
}

export const InteractiveQuizCard: React.FC<InteractiveQuizCardProps> = ({
  quiz,
  onOpenArena,
  onComplete
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults[qIdx]) return; // already revealed
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckAnswer = (qIdx: number) => {
    setShowResults(prev => ({ ...prev, [qIdx]: true }));
    
    // Check if all answered
    const nextResults = { ...showResults, [qIdx]: true };
    if (Object.keys(nextResults).length === quiz.questions.length) {
      setIsFinished(true);
      let correct = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      if (correct / quiz.questions.length >= 0.75) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
      onComplete?.(correct, quiz.questions.length);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults({});
    setShowHints({});
    setIsFinished(false);
  };

  const scoreCount = quiz.questions.reduce((acc, q, idx) => {
    return showResults[idx] && selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="mt-3 border border-emerald-500/30 rounded-2xl bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {quiz.title}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {quiz.difficulty}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Topic: {quiz.topic}</p>
          </div>
        </div>

        {onOpenArena && (
          <button
            onClick={() => onOpenArena(quiz)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 transition"
          >
            <span>Focus Mode</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Questions list */}
      <div className="p-4 space-y-5">
        {quiz.questions.map((q, qIdx) => {
          const isAnswered = selectedAnswers[qIdx] !== undefined;
          const isRevealed = showResults[qIdx];
          const isCorrect = selectedAnswers[qIdx] === q.correctIndex;

          return (
            <div 
              key={q.id || qIdx} 
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2.5"
            >
              {/* Question text */}
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-100 leading-relaxed text-sm">
                  <span className="text-emerald-400 font-bold mr-1.5">Q{qIdx + 1}.</span>
                  {q.question}
                </p>
                {q.hint && !isRevealed && (
                  <button
                    onClick={() => setShowHints(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition flex-shrink-0"
                    title="Get a hint"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hint</span>
                  </button>
                )}
              </div>

              {/* Hint Box */}
              {showHints[qIdx] && !isRevealed && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] italic">
                  💡 <strong>Hint:</strong> {q.hint}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selectedAnswers[qIdx] === optIdx;
                  let optStyle = 'bg-slate-900/80 hover:bg-slate-850 text-slate-200 border-slate-750';

                  if (isRevealed) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isThisSelected && !isCorrect) {
                      optStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                    } else {
                      optStyle = 'bg-slate-900/40 opacity-50 border-slate-850 text-slate-400';
                    }
                  } else if (isThisSelected) {
                    optStyle = 'bg-indigo-600/30 border-indigo-400 text-white font-medium shadow-sm';
                  }

                  const optLetter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      disabled={isRevealed}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-2.5 ${optStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border ${
                        isThisSelected ? 'border-current bg-white/10' : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}>
                        {optLetter}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isRevealed && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {isRevealed && isThisSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action row */}
              {!isRevealed ? (
                <div className="pt-1 flex justify-end">
                  <button
                    disabled={!isAnswered}
                    onClick={() => handleCheckAnswer(qIdx)}
                    className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex items-center gap-1.5"
                  >
                    <span>Check Answer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Explanation block */
                <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed space-y-1 ${
                  isCorrect ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200' : 'bg-rose-950/20 border-rose-600/40 text-slate-300'
                }`}>
                  <p className="font-semibold flex items-center gap-1">
                    {isCorrect ? (
                      <span className="text-emerald-400">✓ Correct!</span>
                    ) : (
                      <span className="text-rose-400">✗ Incorrect (Correct: {String.fromCharCode(65 + q.correctIndex)})</span>
                    )}
                  </p>
                  <p className="text-slate-300">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="text-slate-300">
          Answered: <strong className="text-white">{Object.keys(showResults).length} / {quiz.questions.length}</strong>
          {Object.keys(showResults).length > 0 && (
            <span className="ml-2 text-emerald-400">
              ({scoreCount} correct)
            </span>
          )}
        </div>

        {isFinished && (
          <button
            onClick={resetQuiz}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>
    </div>
  );
};
