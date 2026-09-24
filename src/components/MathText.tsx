import React, { useState } from 'react';
import katex from 'katex';
import { cleanLatexMath } from './FormattedMessage';

interface MathTextProps {
  text: string;
  isMidnight?: boolean;
  className?: string;
}

/**
 * Parses a string containing LaTeX ($...$ or \frac, etc.) or plain text
 * and renders inline KaTeX math or formatted text seamlessly.
 */
export const MathText: React.FC<MathTextProps> = ({ text, isMidnight = false, className = '' }) => {
  if (!text) return null;

  // Split text by LaTeX math delimiters: $...$ or $$...$$
  const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`}>
          {cleanLatexMath(plainText)}
        </span>
      );
    }

    const formula = match[1] || match[2];
    const isDisplayMode = Boolean(match[1]);

    let renderedHtml = '';
    try {
      renderedHtml = katex.renderToString(formula.trim(), {
        displayMode: isDisplayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false
      });
    } catch (_e) {
      renderedHtml = '';
    }

    if (renderedHtml) {
      parts.push(
        <span
          key={`math-${match.index}`}
          className={`inline-block align-baseline ${isDisplayMode ? 'my-2 w-full text-center overflow-x-auto' : 'mx-0.5'}`}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    } else {
      parts.push(
        <span key={`math-fallback-${match.index}`} className="font-mono font-medium mx-0.5">
          {cleanLatexMath(formula)}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    const tailText = text.substring(lastIndex);
    parts.push(
      <span key={`text-${lastIndex}`}>
        {cleanLatexMath(tailText)}
      </span>
    );
  }

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.length > 0 ? parts : cleanLatexMath(text)}
    </span>
  );
};
