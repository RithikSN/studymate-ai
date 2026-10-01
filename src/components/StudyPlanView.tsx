import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  BookOpen, 
  Flame, 
  Plus, 
  Sliders,
  ChevronRight,
  Zap
} from 'lucide-react';
import { StudyPlan, UserProfile } from '../types';
import { StudyPlanCard } from './StudyPlanCard';

interface StudyPlanViewProps {
  activePlan: StudyPlan | null;
  onGeneratePlan: (subject: string, weeks: number, hours: number) => Promise<StudyPlan | null>;
  isGenerating: boolean;
  profile: UserProfile;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  activePlan,
  onGeneratePlan,
  isGenerating,
  profile
}) => {
  const [subject, setSubject] = useState('Operating Systems & Distributed Systems');
  const [weeks, setWeeks] = useState(2);
  const [hours, setHours] = useState(3);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(activePlan);

  const presets = [
    { subject: 'Operating Systems & Concurrency', weeks: 2, hours: 3 },
    { subject: 'Deep Learning & Transformer Architectures', weeks: 3, hours: 2 },
    { subject: 'Biochemistry & Cellular Metabolism', weeks: 2, hours: 4 },
    { subject: 'Data Structures & Algorithmic Problem Solving', weeks: 4, hours: 3 }
  ];

  const handleCreate = async (sub?: string, w?: number, h?: number) => {
    const s = sub || subject;
    const dur = w || weeks;
    const hrs = h || hours;
    const plan = await onGeneratePlan(s, dur, hrs);
    if (plan) {
      setCurrentPlan(plan);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Personalized Study Blueprint & Scheduler
            </h2>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Construct evidence-based revision roadmaps tailored to your exam timeline and daily availability, 
            integrating spaced repetition, active recall sessions, and high-yield milestones.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setSubject(p.subject);
                setWeeks(p.weeks);
                setHours(p.hours);
                handleCreate(p.subject, p.weeks, p.hours);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-950 border border-slate-700/60 text-slate-300 hover:text-blue-300 transition"
            >
              {p.subject}
            </button>
          ))}
        </div>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Configure Revision Parameters</span>
          </h3>
          <span className="text-[11px] text-slate-400">Tailored for: {profile.learningStyle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6">
            <label className="block text-slate-400 font-semibold mb-1">Subject or Exam Target</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Distributed Systems, Organic Chemistry II..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-400 font-semibold mb-1">Target Duration</label>
            <select
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={1}>1 Week (Crash Review)</option>
              <option value={2}>2 Weeks (Balanced)</option>
              <option value={3}>3 Weeks (Deep Mastery)</option>
              <option value={4}>4 Weeks (Full Semester Prep)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-400 font-semibold mb-1">Daily Commitment</label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={1}>1 hour / day</option>
              <option value={2}>2 hours / day</option>
              <option value={3}>3 hours / day</option>
              <option value={5}>5 hours / day (Intensive)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleCreate()}
            disabled={isGenerating || !subject.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Synthesizing Strategy...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Generate Optimized Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Current Plan */}
      {currentPlan && (
        <StudyPlanCard plan={currentPlan} />
      )}

    </div>
  );
};
