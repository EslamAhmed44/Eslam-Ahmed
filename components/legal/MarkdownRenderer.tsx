'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isRtl?: boolean;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isRtl = false,
  className = '',
}) => {
  if (!content) return null;

  const lines = content.split('\n');

  // Helper to format inline bold, italic, and links
  const renderInline = (text: string) => {
    // Split by links [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(formatBoldItalic(text.substring(lastIndex, match.index)));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#F59E0B] underline hover:text-[#FF7A18] transition-colors"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(formatBoldItalic(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : formatBoldItalic(text);
  };

  const formatBoldItalic = (text: string) => {
    // Quick bold parser: **bold**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#F0F3F6]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Italic parser: *italic*
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((sub, j) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return (
            <em key={j} className="italic text-[#F59E0B]">
              {sub.slice(1, -1)}
            </em>
          );
        }
        return sub;
      });
    });
  };

  return (
    <div
      className={`space-y-4 text-xs sm:text-sm leading-relaxed text-[#94A3B8] font-light ${
        isRtl ? 'text-right' : 'text-left'
      } ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h2
              key={idx}
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F3F6] pt-3 pb-2 border-b border-[#F0F3F6]/10 flex items-center gap-2"
            >
              <span className="w-1.5 h-5 bg-[#F59E0B] rounded-full inline-block" />
              <span>{trimmed.replace(/^#\s+/, '')}</span>
            </h2>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-bold text-[#F0F3F6] pt-3 pb-1 border-b border-[#F0F3F6]/05 text-[#F59E0B]"
            >
              {trimmed.replace(/^##\s+/, '')}
            </h3>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-[#F0F3F6] pt-2 pb-0.5 text-[#F59E0B]"
            >
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const contentText = trimmed.replace(/^[-•*]\s+/, '');
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 ps-2 py-0.5"
            >
              <span className="text-[#F59E0B] text-base leading-none mt-1 shrink-0">•</span>
              <div className="flex-1">{renderInline(contentText)}</div>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)/);
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 ps-2 py-0.5"
            >
              <span className="font-mono text-xs text-[#F59E0B] font-semibold shrink-0 mt-0.5">
                {match?.[1]}
              </span>
              <div className="flex-1">{renderInline(match?.[2] || '')}</div>
            </div>
          );
        }

        // Callout / Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-s-2 border-[#F59E0B] bg-[#151A23]/70 px-4 py-3 rounded-r-2xl my-2 text-xs text-[#F0F3F6] italic leading-relaxed"
            >
              {renderInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // Horizontal divider
        if (trimmed === '---') {
          return <hr key={idx} className="border-[#F0F3F6]/10 my-4" />;
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
