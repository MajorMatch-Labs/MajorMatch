/**
 * Markdown Message Renderer for AI Advisor Streaming Chat
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Long Nhat <torikun2005@gmail.com> - Tech Lead & Advisor Module
 */

import React from 'react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Xu ly dinh dang co ban: tach dong va format headers, bold, code block
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // 1. Headers (###, ##, #)
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={lineIdx} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // 2. Unordered lists (- or *)
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemContent = line.slice(2);
        return (
          <li key={lineIdx} className="ml-4 list-disc text-slate-700 dark:text-slate-300 text-xs leading-relaxed my-0.5">
            {formatInlineText(itemContent)}
          </li>
        );
      }

      // 3. Numbered lists (1., 2.)
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 my-0.5 ml-2">
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{numberedMatch[1]}.</span>
            <span>{formatInlineText(numberedMatch[2])}</span>
          </div>
        );
      }

      // 4. Dong trong
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }

      // 5. Doan van thong thuong
      return (
        <p key={lineIdx} className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed my-1">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  /**
   * Xu ly inline text: **bold**, `code`, *italic*
   */
  const formatInlineText = (text: string): React.ReactNode => {
    // Regex cho code inline va bold
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700/80 mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  return <div className="space-y-0.5 select-text">{renderFormattedText(content)}</div>;
};
