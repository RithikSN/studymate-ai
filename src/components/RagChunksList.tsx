import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  ExternalLink, 
  BookMarked,
  Sparkles 
} from 'lucide-react';
import { RetrievedChunk, Citation } from '../types';

interface RagChunksListProps {
  retrievedChunks: RetrievedChunk[];
  citations?: Citation[];
}

export const RagChunksList: React.FC<RagChunksListProps> = ({ retrievedChunks, citations }) => {
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  if ((!retrievedChunks || retrievedChunks.length === 0) && (!citations || citations.length === 0)) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedChunkId(prev => (prev === id ? null : id));
  };

  const getSimColor = (score: number) => {
    if (score >= 0.7) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (score >= 0.4) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
  };

  return (
    <div className="mt-3 border border-amber-500/30 rounded-2xl bg-slate-900/80 shadow-md overflow-hidden text-xs">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/40 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>TF-IDF & Cosine Similarity Context ({retrievedChunks.length} Chunks Matched)</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
          Top-K Ranked
        </span>
      </div>

      {/* Chunks */}
      <div className="p-3 space-y-2">
        {retrievedChunks.map((item, idx) => {
          const isExpanded = expandedChunkId === item.chunk.id;
          return (
            <div 
              key={item.chunk.id || idx}
              className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs"
            >
              <div 
                onClick={() => toggleExpand(item.chunk.id)}
                className="p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center font-bold flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate text-xs">
                      {item.chunk.docTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Section: {item.chunk.sectionTitle || 'General'} • Chunk {item.chunk.chunkIndex}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Cosine Sim Score */}
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${getSimColor(item.similarityScore)}`}>
                    Sim: {item.similarityScore.toFixed(3)}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Matching terms preview */}
              {item.matchingTerms && item.matchingTerms.length > 0 && (
                <div className="px-2.5 pb-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-amber-400" />
                    Matched terms:
                  </span>
                  {item.matchingTerms.map((t, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-amber-200 border border-slate-700/60"
                      title={`TF-IDF contribution: ${t.score.toFixed(3)}`}
                    >
                      {t.term}
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded text */}
              {isExpanded && (
                <div className="p-3 border-t border-slate-850 bg-slate-900/60 text-slate-300 text-[11px] leading-relaxed font-sans whitespace-pre-line border-l-2 border-l-amber-500">
                  {item.chunk.text}
                </div>
              )}
            </div>
          );
        })}

        {/* Web Search Grounding Citations */}
        {citations && citations.some(c => c.sourceType === 'web') && (
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Verified Web Sources & Citations
            </span>
            <div className="flex flex-wrap gap-2">
              {citations.filter(c => c.sourceType === 'web').map((cit, cIdx) => (
                <a
                  key={cIdx}
                  href={cit.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-[200px]">{cit.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
