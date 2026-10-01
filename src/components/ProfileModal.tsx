import React from 'react';
import { User, GraduationCap, Sparkles, Award, Flame, Zap, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  docCount: number;
  chunkCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  docCount,
  chunkCount
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof UserProfile, value: any) => {
    onUpdateProfile({ ...profile, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-xs text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Student Learning Profile</h3>
              <p className="text-[11px] text-slate-400">Personalize AI pedagogy & academic difficulty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              Streak
            </span>
            <p className="text-base font-bold text-white mt-0.5">{profile.streakDays} Days</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              Quizzes
            </span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{profile.quizzesCompleted}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-indigo-400" />
              Chunks
            </span>
            <p className="text-base font-bold text-indigo-300 mt-0.5 font-mono">{chunkCount}</p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Student Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Academic Level</label>
            <select
              value={profile.gradeLevel}
              onChange={(e) => handleChange('gradeLevel', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="High School">High School (AP / IB / Secondary)</option>
              <option value="Undergraduate">Undergraduate (College / University)</option>
              <option value="Graduate">Graduate (Master's / Ph.D. / Research)</option>
              <option value="Self-learner">Self-Directed Learner</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Preferred Learning Style</label>
            <select
              value={profile.learningStyle}
              onChange={(e) => handleChange('learningStyle', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Visual & Analogies">Visual & Vivid Real-World Analogies</option>
              <option value="Intuitive & Practical">Intuitive & Practical Application</option>
              <option value="Rigorous & Mathematical">Rigorous Proofs & Mathematical Mechanics</option>
              <option value="Fast & High-Yield">Fast, Concise & High-Yield Summary</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Current Active Focus / Subject</label>
            <input
              type="text"
              value={profile.activeSubject}
              onChange={(e) => handleChange('activeSubject', e.target.value)}
              placeholder="e.g. Operating Systems, Deep Learning, Molecular Biology"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
};
