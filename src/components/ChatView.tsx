import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User, 
  Cpu, 
  FileSearch, 
  Award, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Search, 
  Globe, 
  CornerDownLeft,
  Loader2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { ChatMessage, AgentTool, Quiz, StudyPlan, EvaluationResult, TopicExplanation, DocumentChunk, UserProfile } from '../types';
import { AgentThoughtDrawer } from './AgentThoughtDrawer';
import { InteractiveQuizCard } from './InteractiveQuizCard';
import { StudyPlanCard } from './StudyPlanCard';
import { EvaluationCard } from './EvaluationCard';
import { TopicCard } from './TopicCard';
import { RagChunksList } from './RagChunksList';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  toolMode: AgentTool | 'auto';
  setToolMode: (mode: AgentTool | 'auto') => void;
  profile: UserProfile;
  chunks: DocumentChunk[];
  onOpenArenaWithQuiz?: (quiz: Quiz) => void;
  onClearChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  toolMode,
  setToolMode,
  profile,
  chunks,
  onOpenArenaWithQuiz,
  onClearChat
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const samplePrompts = [
    {
      title: 'TF-IDF RAG Search',
      prompt: 'Explain how the TLB reduces address translation overhead from our Operating Systems notes',
      icon: FileSearch,
      color: 'hover:border-amber-500/50 hover:bg-amber-950/20'
    },
    {
      title: 'Practice Quiz',
      prompt: 'Generate an intermediate 4-question quiz on Transformer Self-Attention mechanics',
      icon: Award,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/20'
    },
    {
      title: 'Exam Study Plan',
      prompt: 'Create a 2-week personalized study plan for Operating Systems final exam (3 hours/day)',
      icon: Calendar,
      color: 'hover:border-blue-500/50 hover:bg-blue-950/20'
    },
    {
      title: 'Evaluate My Answer',
      prompt: "Evaluate my answer: 'Quicksort has O(n^2) worst case when the selected pivot is always the minimum or maximum element, such as in an already sorted array without random pivoting.'",
      icon: CheckCircle2,
      color: 'hover:border-purple-500/50 hover:bg-purple-950/20'
    },
    {
      title: 'Analogy & Concept',
      prompt: 'Explain supervised learning in simple terms with an analogy',
      icon: BookOpen,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-950/20'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full px-4 sm:px-6">
      
      {/* Top status bar */}
      <div className="py-2.5 flex items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Router:</span>
            <span className="text-indigo-300 font-semibold uppercase text-[10px]">
              {toolMode === 'auto' ? 'Autonomous Dispatch' : toolMode.replace('_', ' ')}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Knowledge base: <strong className="text-slate-200">{chunks.length} chunks</strong> indexed
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto space-y-6 my-auto py-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[9px] font-bold text-white items-center justify-center">AI</span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                What would you like to master today?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                StudyMate AI's single agentic core analyzes your request, dynamically dispatches tools—from 
                <span className="text-amber-300 font-medium"> TF-IDF Document RAG</span> and 
                <span className="text-emerald-300 font-medium"> Interactive Quizzes</span> to 
                <span className="text-blue-300 font-medium"> Study Plans</span> and 
                <span className="text-purple-300 font-medium"> Rubric Evaluations</span>.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(item.prompt);
                      onSendMessage(item.prompt);
                    }}
                    className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs transition-all flex items-start gap-2.5 group ${item.color}`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200 group-hover:text-white transition">
                        {item.title}
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, mIdx) => {
            const isUser = msg.sender === 'user';
            const isLastAgentMsg = !isUser && mIdx === messages.length - 1;
            const isErrorMsg = !isUser && msg.text.includes('issue processing');

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-300 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message bubble with Markdown formatting */}
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : isErrorMsg
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {isErrorMsg && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20 flex justify-end">
                        <button
                          onClick={() => {
                            const lastUser = [...messages].reverse().find(m => m.sender === 'user');
                            if (lastUser) onSendMessage(lastUser.text);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry Query</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Agent Thought Drawer */}
                  {msg.thought && (
                    <AgentThoughtDrawer thought={msg.thought} />
                  )}

                  {/* Retrieved Chunks from RAG */}
                  {msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                    <RagChunksList
                      retrievedChunks={msg.retrievedChunks}
                      citations={msg.citations}
                    />
                  )}

                  {/* Interactive Quiz Widget */}
                  {msg.quizData && (
                    <InteractiveQuizCard
                      quiz={msg.quizData}
                      onOpenArena={onOpenArenaWithQuiz}
                    />
                  )}

                  {/* Interactive Study Plan Widget */}
                  {msg.studyPlanData && (
                    <StudyPlanCard plan={msg.studyPlanData} />
                  )}

                  {/* Interactive Answer Evaluation Widget */}
                  {msg.evaluationData && (
                    <EvaluationCard evaluation={msg.evaluationData} />
                  )}

                  {/* Interactive Concept Breakdown Widget */}
                  {msg.topicData && (
                    <TopicCard
                      topicData={msg.topicData}
                      onGenerateQuiz={(t) => onSendMessage(`Generate a practice quiz on ${t}`)}
                    />
                  )}

                  {/* Follow-up Suggestion Chips for latest agent message */}
                  {isLastAgentMsg && !isErrorMsg && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => onSendMessage(`Quiz me on this concept with 4 questions`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-[11px] transition shadow-sm"
                      >
                        <Award className="w-3 h-3" />
                        <span>Quiz me on this</span>
                      </button>
                      <button
                        onClick={() => onSendMessage(`Create a study plan for this topic`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-300 text-[11px] transition shadow-sm"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Add to Study Plan</span>
                      </button>
                      <button
                        onClick={() => onSendMessage(`Explain this concept with another real-world analogy`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-[11px] transition shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Another Analogy</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1 font-bold text-xs">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-sm items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center gap-3 shadow-md">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <div>
                <span className="font-semibold text-white">Agent reasoning in progress...</span>
                <p className="text-[11px] text-slate-400">Classifying intent & synthesizing optimal response</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="pt-2 pb-4">
        <form
          onSubmit={handleSubmit}
          className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/40 transition"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              toolMode === 'rag_document_qa'
                ? 'Ask a question grounded in your uploaded documents and notes...'
                : toolMode === 'quiz_generate'
                ? 'Enter topic to generate an interactive quiz (e.g. "Photosynthesis", "Virtual Memory")...'
                : toolMode === 'study_plan'
                ? 'Specify your subject, deadline, or exam goal for a custom study schedule...'
                : toolMode === 'answer_evaluate'
                ? 'Paste an exam question followed by your drafted answer for rubric grading...'
                : 'Ask anything, request a quiz, study plan, answer check, or document query...'
            }
            rows={2}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-xs sm:text-sm px-3 py-1.5 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-1 px-2 border-t border-slate-850">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Press <strong className="text-slate-400">Enter</strong> to send</span>
              <span>•</span>
              <span className="hidden sm:inline">Shift+Enter for newline</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition"
              >
                <span>Ask Agent</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};

