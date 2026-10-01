import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { StudyPlan } from '../types';

interface StudyPlanCardProps {
  plan: StudyPlan;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ plan }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const totalTasks = plan.phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const togglePhase = (idx: number) => {
    setExpandedPhases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const exportPlanAsText = () => {
    let content = `# Study Plan: ${plan.title}\nSubject: ${plan.subject}\nTarget: ${plan.targetGoal}\nDuration: ${plan.durationWeeks} Weeks | ${plan.hoursPerDay} Hours/Day\n\nOverview:\n${plan.overview}\n\n`;
    plan.phases.forEach((p, i) => {
      content += `## ${p.phaseName} (${p.duration})\nFocus: ${p.focus}\n`;
      p.tasks.forEach(t => {
        const done = completedTasks[t.id] ? '[x]' : '[ ]';
        content += `- ${done} ${t.title} (${t.durationMinutes} mins - ${t.technique})\n`;
      });
      content += '\n';
    });
    content += `Key Tips:\n${plan.keyTips.map(tip => `- ${tip}`).join('\n')}\n`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.subject.toLowerCase().replace(/\s+/g, '-')}-study-plan.md`;
    a.click();
  };

  return (
    <div className="mt-3 border border-blue-500/30 rounded-2xl bg-slate-900/90 shadow-xl overflow-hidden text-xs">
      {/* Header banner */}
      <div className="p-4 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border-b border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-blue-500/20 text-blue-400">
                <Calendar className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-white">{plan.title}</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] max-w-2xl">{plan.overview}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportPlanAsText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 transition"
              title="Download Plan Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Metric pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Duration: <strong className="text-white">{plan.durationWeeks} Weeks</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Target Pace: <strong className="text-white">{plan.hoursPerDay} hrs/day</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Goal: <strong className="text-indigo-300">{plan.targetGoal}</strong>
          </span>
        </div>

        {/* Interactive Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Plan Execution Progress</span>
            <span className="font-semibold text-blue-300">{doneCount} of {totalTasks} tasks ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phases and Tasks */}
      <div className="p-4 space-y-3">
        {plan.phases.map((phase, pIdx) => {
          const isExpanded = expandedPhases[pIdx] ?? true;
          return (
            <div key={pIdx} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <button
                onClick={() => togglePhase(pIdx)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-900/60 transition text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                    {pIdx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs">{phase.phaseName}</h5>
                    <p className="text-[10px] text-slate-400">{phase.duration} • Focus: {phase.focus}</p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 pt-1 border-t border-slate-850 space-y-2">
                  {phase.tasks.map((task) => {
                    const isDone = completedTasks[task.id] || false;
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition ${
                          isDone 
                            ? 'bg-blue-950/20 border-blue-600/40 text-slate-400 line-through' 
                            : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleTask(task.id)}
                            className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="font-medium text-xs leading-snug">{task.title}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                            {task.technique}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.durationMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* High yield study tactics */}
        {plan.keyTips && plan.keyTips.length > 0 && (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Study Tactics</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              {plan.keyTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
