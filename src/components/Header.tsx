import React from 'react';
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  FileSearch, 
  Cpu, 
  Search, 
  User, 
  Flame, 
  Award,
  Zap
} from 'lucide-react';
import { AgentTool, UserProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toolMode: AgentTool | 'auto';
  setToolMode: (mode: AgentTool | 'auto') => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  docCount: number;
  chunkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  toolMode,
  setToolMode,
  profile,
  onOpenProfile,
  docCount,
  chunkCount
}) => {
  const tabs = [
    { id: 'chat', label: 'Agent Assistant', icon: Bot, badge: 'Agentic' },
    { id: 'rag', label: 'RAG Knowledge Base', icon: FileSearch, badge: `${chunkCount} Chunks` },
    { id: 'quiz', label: 'Quiz Arena', icon: Award },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'evaluator', label: 'Answer Evaluator', icon: CheckCircle2 },
    { id: 'explainer', label: 'Concept Explainer', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5 text-white" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  StudyMate<span className="text-indigo-400">AI</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  Agentic RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Learning Assistant & Document Reasoner
              </p>
            </div>
          </div>

          {/* Center: Agent Mode Selector */}
          <div className="hidden lg:flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 font-medium border-r border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Router:</span>
            </div>
            <button
              onClick={() => setToolMode('auto')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
                toolMode === 'auto'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Autonomous Agent</span>
            </button>
            <div className="relative inline-block ml-1">
              <select
                value={toolMode === 'auto' ? '' : toolMode}
                onChange={(e) => setToolMode((e.target.value as AgentTool) || 'auto')}
                className={`bg-transparent text-xs py-1 px-2.5 rounded-md focus:outline-none cursor-pointer border border-transparent hover:border-slate-700 transition ${
                  toolMode !== 'auto' ? 'bg-indigo-950 text-indigo-200 border-indigo-700 font-semibold' : 'text-slate-400'
                }`}
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  {toolMode === 'auto' ? 'Override Mode...' : 'Mode Override'}
                </option>
                <option value="rag_document_qa" className="bg-slate-900 text-white">TF-IDF RAG Search</option>
                <option value="quiz_generate" className="bg-slate-900 text-white">Quiz Generator</option>
                <option value="study_plan" className="bg-slate-900 text-white">Study Planner</option>
                <option value="answer_evaluate" className="bg-slate-900 text-white">Answer Evaluator</option>
                <option value="topic_explain" className="bg-slate-900 text-white">Concept Explainer</option>
                <option value="web_search" className="bg-slate-900 text-white">Web Search Grounding</option>
              </select>
            </div>
          </div>

          {/* Right: Quick Stats & Profile */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{profile.streakDays}d</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>{profile.quizzesCompleted} Quizzes</span>
              </div>
            </div>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 hover:text-white transition"
              title="Student Profile & Settings"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {profile.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">{profile.name}</span>
                <span className="text-[10px] text-slate-400">{profile.gradeLevel}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 scrollbar-none text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
