import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-indigo-300 mt-2 mb-1 flex items-center gap-1.5">
              <span>{formatInline(trimmed.replace('### ', ''))}</span>
            </h4>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-extrabold text-white mt-3 mb-1">
              {formatInline(trimmed.replace('## ', ''))}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const itemText = trimmed.replace(/^[*•-]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-400 font-bold mt-1 text-[10px]">•</span>
              <span className="flex-1">{formatInline(itemText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-mono text-indigo-400 font-bold text-xs">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Inline formatter for **bold**, *italic*, `code`
function formatInline(text: string): React.ReactNode {
  // Regex to split by **bold**, `code`, or *italic*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
