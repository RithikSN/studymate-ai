import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  ChevronRight,
  BookOpen,
  Sliders,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, DocumentChunk } from '../types';

interface QuizArenaProps {
  activeQuiz: Quiz | null;
  onGenerateQuiz: (topic: string, difficulty: 'Beginner' | 'Intermediate' | 'Advanced', count: number) => Promise<Quiz | null>;
  isGenerating: boolean;
  chunks: DocumentChunk[];
  onRecordScore?: (score: number, total: number) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  activeQuiz,
  onGenerateQuiz,
  isGenerating,
  chunks,
  onRecordScore
}) => {
  const [topicInput, setTopicInput] = useState('Operating Systems: Virtual Memory & Concurrency');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionCount, setQuestionCount] = useState(4);

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(activeQuiz);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Quick preset topics
  const presets = [
    { label: 'Virtual Memory & TLBs', difficulty: 'Intermediate' as const },
    { label: 'Transformer Attention Mechanics', difficulty: 'Advanced' as const },
    { label: 'Cellular Respiration & Krebs Cycle', difficulty: 'Intermediate' as const },
    { label: 'Deadlock Coffman Conditions', difficulty: 'Intermediate' as const },
    { label: 'Sorting Algorithms & Big-O', difficulty: 'Beginner' as const }
  ];

  const handleGenerate = async (topicToUse?: string, diffToUse?: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const t = topicToUse || topicInput;
    const d = diffToUse || difficulty;
    const generated = await onGenerateQuiz(t, d, questionCount);
    if (generated) {
      setCurrentQuiz(generated);
      setCurrentQIndex(0);
      setUserAnswers({});
      setSubmittedAnswers({});
      setShowHint(false);
      setQuizCompleted(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (submittedAnswers[currentQIndex]) return;
    setUserAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const handleCheckCurrent = () => {
    setSubmittedAnswers(prev => ({ ...prev, [currentQIndex]: true }));
    setShowHint(false);

    // If last question, finish
    if (currentQuiz && currentQIndex === currentQuiz.questions.length - 1) {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;
    setQuizCompleted(true);
    let correctCount = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correctCount++;
    });

    const percent = correctCount / currentQuiz.questions.length;
    if (percent >= 0.75) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    onRecordScore?.(correctCount, currentQuiz.questions.length);
  };

  const currentQ: QuizQuestion | undefined = currentQuiz?.questions[currentQIndex];
  const isCurrentRevealed = submittedAnswers[currentQIndex];
  const isCurrentAnswered = userAnswers[currentQIndex] !== undefined;

  const totalCorrect = currentQuiz
    ? currentQuiz.questions.reduce((acc, q, idx) => {
        return userAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Quiz Arena
            </h2>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Test and cement your academic retention with dynamically synthesized practice questions, 
            instant feedback, hints, and rigorous pedagogical explanations.
          </p>
        </div>

        {/* Quick presets row */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopicInput(p.label);
                setDifficulty(p.difficulty);
                handleGenerate(p.label, p.difficulty);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-emerald-950 border border-slate-700/60 text-slate-300 hover:text-emerald-300 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Generator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Generate New Practice Quiz</span>
          </h3>
          <span className="text-[11px] text-slate-400">Powered by Gemini 3.8 Flash</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6">
            <label className="block text-slate-400 font-semibold mb-1">Topic or Document Focus</label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Scaled Dot-Product Attention, Glycolysis steps..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-400 font-semibold mb-1">Target Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Beginner">Beginner (Foundations)</option>
              <option value="Intermediate">Intermediate (Standard)</option>
              <option value="Advanced">Advanced (Tricky Edge Cases)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !topicInput.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Quiz ({questionCount} Qs)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Quiz Card / Question Flow */}
      {currentQuiz && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header of Active Quiz */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentQuiz.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentQuiz.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400">Topic: {currentQuiz.topic}</p>
            </div>

            {/* Question pagination pills */}
            <div className="flex items-center gap-1.5">
              {currentQuiz.questions.map((_, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = submittedAnswers[idx];
                const isCorrect = userAnswers[idx] === currentQuiz.questions[idx].correctIndex;

                let pillColor = 'bg-slate-800 text-slate-400 border-slate-700';
                if (isAnswered) {
                  pillColor = isCorrect
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                    : 'bg-rose-950 text-rose-300 border-rose-500 font-bold';
                } else if (isCurrent) {
                  pillColor = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400/50';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setShowHint(false);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-mono border flex items-center justify-center transition ${pillColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {!quizCompleted && currentQ ? (
            /* Question Body */
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Question {currentQIndex + 1} of {currentQuiz.questions.length}
                  </span>
                  <p className="text-base font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {currentQ.hint && !isCurrentRevealed && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                  </button>
                )}
              </div>

              {/* Hint Callout */}
              {showHint && !isCurrentRevealed && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs italic">
                  💡 <strong>Hint:</strong> {currentQ.hint}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === optIdx;
                  let optStyle = 'bg-slate-950/70 hover:bg-slate-950 border-slate-800 text-slate-200';

                  if (isCurrentRevealed) {
                    if (optIdx === currentQ.correctIndex) {
                      optStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-semibold';
                    } else if (isSelected) {
                      optStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      optStyle = 'bg-slate-950/30 opacity-40 border-slate-850 text-slate-400';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-emerald-600/25 border-emerald-500 text-white font-medium ring-1 ring-emerald-500/50';
                  }

                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      disabled={isCurrentRevealed}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center gap-3 ${optStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold border flex-shrink-0 ${
                        isSelected ? 'border-current bg-white/10' : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {isCurrentRevealed && optIdx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isCurrentRevealed && isSelected && optIdx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box (when revealed) */}
              {isCurrentRevealed && (
                <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                  userAnswers[currentQIndex] === currentQ.correctIndex
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                }`}>
                  <p className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    {userAnswers[currentQIndex] === currentQ.correctIndex ? (
                      <span className="text-emerald-400">✓ Correct Answer!</span>
                    ) : (
                      <span className="text-rose-400">✗ Incorrect (Option {String.fromCharCode(65 + currentQ.correctIndex)})</span>
                    )}
                  </p>
                  <p className="text-slate-300 text-xs leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-slate-300 text-xs transition"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {!isCurrentRevealed ? (
                    <button
                      disabled={!isCurrentAnswered}
                      onClick={handleCheckCurrent}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition"
                    >
                      Check Answer
                    </button>
                  ) : (
                    currentQIndex < currentQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => {
                          setCurrentQIndex(prev => prev + 1);
                          setShowHint(false);
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={finishQuiz}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md transition"
                      >
                        View Full Results
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
                <p className="text-slate-400 text-xs">
                  Here is how you performed on <strong>{currentQuiz.title}</strong>
                </p>
              </div>

              <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400">Score</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {totalCorrect} / {currentQuiz.questions.length}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[11px] text-slate-400">Accuracy</span>
                  <p className="text-2xl font-black text-white font-mono">
                    {Math.round((totalCorrect / currentQuiz.questions.length) * 100)}%
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[11px] text-slate-400">Level</span>
                  <p className="text-2xl font-black text-teal-400 font-mono">
                    {currentQuiz.difficulty}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentQIndex(0);
                    setUserAnswers({});
                    setSubmittedAnswers({});
                    setShowHint(false);
                    setQuizCompleted(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake This Quiz</span>
                </button>

                <button
                  onClick={() => handleGenerate(currentQuiz.topic, 'Advanced')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Advanced Questions</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
