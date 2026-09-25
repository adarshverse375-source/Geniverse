import React from 'react';
import katex from 'katex';
import { TheoremDiagram, DiagramType } from './TheoremDiagram';

interface FormattedMessageProps {
  content: string;
  isMidnight?: boolean;
}

/**
 * Renders a real vertical mathematical fraction with top numerator,
 * horizontal division bar, and bottom denominator.
 */
export const StackedFraction: React.FC<{
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  isMidnight?: boolean;
}> = ({ numerator, denominator, isMidnight = false }) => {
  return (
    <span className="inline-flex flex-col text-center align-middle mx-1 font-semibold text-[0.9em] leading-none select-text">
      <span className={`border-b ${isMidnight ? 'border-indigo-400 text-indigo-200' : 'border-slate-700 text-slate-900'} pb-0.5 px-1`}>
        {numerator}
      </span>
      <span className={`pt-0.5 px-1 ${isMidnight ? 'text-indigo-300' : 'text-slate-800'}`}>
        {denominator}
      </span>
    </span>
  );
};

/**
 * Cleans LaTeX commands and prepares them for professional Unicode and KaTeX rendering.
 * Strips all dollar signs so answers never display ugly "$" signs.
 */
export function cleanLatexMath(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove dollar signs enclosing numbers or simple quantities like $2.5$, $3$, $100$, $0.5$
  cleaned = cleaned.replace(/\$(\d+(?:\.\d+)?)\$/g, '$1');

  // 2. Remove dollar signs around units like $cm$, $cm^2$, $m/s$, $kg$, etc.
  cleaned = cleaned.replace(/\$([a-zA-Z]+(?:\^[0-9]+|\/[a-zA-Z]+)?)\$/g, '$1');

  // 3. Extract and convert $$...$$ block formulas
  cleaned = cleaned.replace(/\$\$(.+?)\$\$/gs, (_match, eq) => `\n[EQUATION]${eq.trim()}[/EQUATION]\n`);

  // 4. Remove single dollar delimiters around math
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (_match, eq) => {
    // If it contains a fraction \frac, keep the LaTeX so KaTeX can render the real fraction bar!
    if (eq.includes('\\frac')) {
      return `[MATH]${eq}[/MATH]`;
    }
    return formatMathSymbols(eq);
  });

  // 5. Clean standalone symbols
  cleaned = formatMathSymbols(cleaned);

  // 6. Strip any isolated stray single dollar signs attached to numbers or units
  cleaned = cleaned.replace(/\$(\d+(?:\.\d+)?)/g, '$1');
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\$/g, '$1');
  cleaned = cleaned.replace(/\$([a-zA-Z]+[²³]?)/g, '$1');
  cleaned = cleaned.replace(/([a-zA-Z]+[²³]?)\$/g, '$1');

  return cleaned;
}

/**
 * Replaces common LaTeX symbols with clean Unicode symbols.
 * IMPORTANT: Does NOT turn \frac into simple (a / b) so real vertical fractions can be displayed!
 */
function formatMathSymbols(raw: string): string {
  let str = raw;

  const replacements: [RegExp, string][] = [
    [/\\times/g, '×'],
    [/\\div/g, '÷'],
    [/\\pm/g, '±'],
    [/\\mp/g, '∓'],
    [/\\approx/g, '≈'],
    [/\\neq/g, '≠'],
    [/\\le(q)?(?![a-zA-Z])/g, '≤'],
    [/\\ge(q)?(?![a-zA-Z])/g, '≥'],
    [/\\infty/g, '∞'],
    [/\\cdot/g, '·'],
    [/\\rightarrow/g, '→'],
    [/\\Rightarrow/g, '⇒'],
    [/\\therefore/g, '∴'],
    [/\\because/g, '∵'],
    [/\\degree/g, '°'],
    [/\^\\circ/g, '°'],
    [/\\circ/g, '°'],
    [/\\pi/g, 'π'],
    [/\\theta/g, 'θ'],
    [/\\alpha/g, 'α'],
    [/\\beta/g, 'β'],
    [/\\gamma/g, 'γ'],
    [/\\Delta/g, 'Δ'],
    [/\\lambda/g, 'λ'],
    [/\\mu/g, 'μ'],
    [/\\sigma/g, 'σ'],
    [/\\omega/g, 'ω'],
    [/\\sum/g, '∑'],
    [/\\int/g, '∫'],
    // Square roots \sqrt{x} -> √(x)
    [/\\sqrt\{([^}]+)\}/g, '√($1)'],
    [/\\sqrt/g, '√'],
    // Text blocks inside math \text{word} -> word
    [/\\text\{([^}]+)\}/g, '$1'],
    [/\\mathbf\{([^}]+)\}/g, '$1'],
    [/\\mathit\{([^}]+)\}/g, '$1'],
    [/\\mathrm\{([^}]+)\}/g, '$1'],
    // Superscripts
    [/\^2(?![0-9a-zA-Z])/g, '²'],
    [/\^3(?![0-9a-zA-Z])/g, '³'],
    [/\^0(?![0-9a-zA-Z])/g, '⁰'],
    [/\^1(?![0-9a-zA-Z])/g, '¹'],
    [/\^4(?![0-9a-zA-Z])/g, '⁴'],
    [/\^n(?![0-9a-zA-Z])/g, 'ⁿ'],
    // Subscripts
    [/_2(?![0-9a-zA-Z])/g, '₂'],
    [/_3(?![0-9a-zA-Z])/g, '₃'],
    [/_4(?![0-9a-zA-Z])/g, '₄'],
    [/_n(?![0-9a-zA-Z])/g, 'ₙ'],
    [/_0(?![0-9a-zA-Z])/g, '₀'],
    [/_1(?![0-9a-zA-Z])/g, '₁'],
    [/\\propto/g, '∝'],
    [/\\Omega/g, 'Ω'],
    [/\\rho/g, 'ρ'],
    [/\\phi/g, 'φ'],
    [/\\nabla/g, '∇'],
    [/\\hbar/g, 'ℏ'],
    [/\\rightleftharpoons/g, '⇌'],
    [/\\leftrightarrow/g, '↔'],
    [/=>/g, '⇒'],
    [/->/g, '→'],
  ];

  for (const [regex, replacement] of replacements) {
    str = str.replace(regex, replacement);
  }

  return str;
}

/**
 * Attempts to render math using KaTeX.
 * If successful, returns the rendered HTML; otherwise returns null.
 */
function renderWithKaTeX(latex: string, displayMode = false): string | null {
  try {
    // Sanitize latex for KaTeX: replace Area(ADE) with \text{Area}(ADE) if not formatted
    let sanitized = latex
      .replace(/Area\(([a-zA-Z]+)\)/g, '\\text{Area}($1)')
      .replace(/area\(([a-zA-Z]+)\)/g, '\\text{Area}($1)')
      .replace(/triangle\s+([a-zA-Z]+)/gi, '\\triangle $1')
      .replace(/HCF\(([a-zA-Z0-9,\s]+)\)/gi, '\\text{HCF}($1)')
      .replace(/LCM\(([a-zA-Z0-9,\s]+)\)/gi, '\\text{LCM}($1)')
      .replace(/=>/g, ' \\Rightarrow ')
      .replace(/->/g, ' \\rightarrow ')
      .replace(/\s*\*\s*/g, ' \\times ');

    return katex.renderToString(sanitized, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });
  } catch (_e) {
    return null;
  }
}

/**
 * Renders mathematical expressions with real vertical fractions.
 * Uses KaTeX first, and falls back to React StackedFraction elements.
 */
export const MathExpression: React.FC<{
  expression: string;
  isBlock?: boolean;
  isMidnight?: boolean;
}> = ({ expression, isBlock = false, isMidnight = false }) => {
  const html = renderWithKaTeX(expression, isBlock);

  if (html) {
    return (
      <span
        className={`inline-block align-middle ${isBlock ? 'my-1 w-full text-center overflow-x-auto py-0.5' : 'mx-1'}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Fallback: Parse \frac{num}{den} into real stacked fractions
  return (
    <span className="inline-flex items-center align-middle flex-wrap gap-1 font-mono">
      {renderFractionFallback(expression, isMidnight)}
    </span>
  );
};

/**
 * Fallback parser that turns \frac{A}{B} into real vertical stacked fraction elements
 */
function renderFractionFallback(str: string, isMidnight: boolean): React.ReactNode {
  // Regex to match \frac{numerator}{denominator}
  const fracRegex = /\\frac\{([^}]+)\}\{([^}]+)\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fracRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const num = match[1];
    const den = match[2];
    parts.push(
      <StackedFraction
        key={`frac-${match.index}`}
        numerator={formatMathSymbols(num)}
        denominator={formatMathSymbols(den)}
        isMidnight={isMidnight}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

export interface DetectedFormula {
  formulaText: string;
  category: 'chemistry' | 'physics' | 'math' | 'general';
  title?: string;
}

export function detectFormulaLine(rawText: string): DetectedFormula | null {
  if (!rawText) return null;
  const line = rawText.trim();
  if (!line) return null;

  // 1. Explicit tags: [EQUATION]...[/EQUATION], [FORMULA]...[/FORMULA], [REACTION]...[/REACTION]
  const tagMatch = line.match(/^\[(EQUATION|FORMULA|REACTION|CHEMICAL_EQUATION)\]([\s\S]*?)\[\/\1\]$/i);
  if (tagMatch) {
    const content = tagMatch[2].trim();
    const isChem = /→|->|\(s\)|\(l\)|\(g\)|\(aq\)|H2O|CO2|NaCl|Ca\(OH\)|HCl|NaOH|SO4|CuSO/i.test(content);
    return {
      formulaText: content,
      category: isChem ? 'chemistry' : 'physics',
      title: isChem ? 'Chemical Equation' : 'Formula / Law'
    };
  }

  // 2. Lines with bullet / bold / plain prefix like:
  // "• Formula: V \propto I => V = IR"
  // "• Key Formula: HCF(a, b) × LCM(a, b) = a × b"
  // "• Chemical Equation: CaO + H₂O → Ca(OH)₂"
  // "• Reaction: 2H₂ + O₂ → 2H₂O"
  // "• Ohm's Law: V = IR"
  // "Formula: V = IR"
  // "Chemical Reaction: ..."
  const prefixMatch = line.match(
    /^([*•-]\s*)?(\*\*)?(Formula|Key Formula|Formulae|Equation|Chemical Equation|Balanced Chemical Equation|Chemical Reaction|Reaction|Mathematical Form|Mathematical Formula|Physical Law|Law|Relation)(\*\*)?\s*[:=]\s*(.+)$/i
  );
  if (prefixMatch) {
    const rawLabel = prefixMatch[3].trim();
    let expr = prefixMatch[5].trim();
    // Strip surrounding markdown bold / backticks if any
    expr = expr.replace(/^\*\*(.+)\*\*$/, '$1').replace(/^`(.+)`$/, '$1').trim();

    // Check if the expression contains an actual formula (has =, ∝, →, \frac, +, ×, etc.)
    const hasMathOrChem = /[=∝→⇒+\-×÷*/^√]|\b(frac|HCF|LCM|Area|sin|cos|tan)\b/i.test(expr);
    if (hasMathOrChem) {
      const isChem = /chemical|reaction/i.test(rawLabel) || /→|->|\(s\)|\(l\)|\(g\)|\(aq\)/i.test(expr);
      return {
        formulaText: expr,
        category: isChem ? 'chemistry' : 'physics',
        title: rawLabel
      };
    }
  }

  // 3. Lines starting with \frac or mathematical relations like Area(ADE)/Area(BDE)
  if (line.startsWith('\\frac{') || (line.startsWith('Area(') && line.includes('\\frac'))) {
    return {
      formulaText: line,
      category: 'math',
      title: 'Mathematical Relation'
    };
  }

  // 4. Standalone well-known formulas and chemical equations (clean of bullet prefix):
  const cleanLine = line.replace(/^([*•-]\s*)/, '').trim();

  // Chemical reaction with arrow (e.g., 2H₂ + O₂ → 2H₂O or CaO + H₂O -> Ca(OH)₂):
  const hasArrow = /(?:→|->|⇌|\\rightarrow)/.test(cleanLine);
  const hasChemicalFormula = /\b(H[0-9₂]?|O[0-9₂₃]?|C[0-9]?|CO[0-9₂]?|H[0-9₂]?O|NaCl|CaO|Ca\(OH\)[0-9₂]?|CuSO[0-9₄]?|Fe|Zn|Mg|Al|HCl|NaOH|SO[0-9₄]?)\b|[A-Z][a-z]?[0-9₀-₉]/.test(cleanLine);
  if (hasArrow && hasChemicalFormula && (cleanLine.includes('+') || /\([sgl]|aq\)/i.test(cleanLine) || /[A-Z][a-z]?[₀-₉0-9]/.test(cleanLine))) {
    return {
      formulaText: cleanLine,
      category: 'chemistry',
      title: 'Chemical Reaction'
    };
  }

  // Core CBSE Math / Physics Formulas on their own line:
  const isCoreFormula =
    /^(HCF\s*\(.+?\)\s*[×*]\s*LCM\s*\(.+?\)\s*=\s*.+)$/i.test(cleanLine) ||
    /^(V\s*(∝|\\propto)\s*I\s*(⇒|=>)?\s*.*V\s*=\s*I\s*[*×]?\s*R.*)$/i.test(cleanLine) ||
    /^(V\s*=\s*I\s*[*×]?\s*R)$/i.test(cleanLine) ||
    /^(P\s*=\s*V\s*[*×]?\s*I.*)$/i.test(cleanLine) ||
    /^(R\s*=\s*(ρ|\\rho)\s*.*)$/i.test(cleanLine) ||
    /^(H\s*=\s*I²\s*[*×]?\s*R\s*[*×]?\s*t.*)$/i.test(cleanLine) ||
    /^(\\frac\{1\}\{f\}\s*=\s*\\frac\{1\}\{v\}\s*[+-]\s*\\frac\{1\}\{u\}).*$/i.test(cleanLine) ||
    /^(\\frac\{1\}\{R_?p?\}\s*=\s*\\frac\{1\}\{R_?1?\}\s*\+\s*\\frac\{1\}\{R_?2?\}).*$/i.test(cleanLine) ||
    /^(R_?s?\s*=\s*R_?1?\s*\+\s*R_?2?.*)$/i.test(cleanLine) ||
    /^(ax²\s*\+\s*bx\s*\+\s*c\s*=\s*0)$/i.test(cleanLine) ||
    /^(x\s*=\s*\\frac\{-b\s*\\pm\s*\\sqrt\{b²\s*-\s*4ac\}\}\{2a\}).*$/i.test(cleanLine) ||
    /^(D\s*=\s*b²\s*-\s*4ac)$/i.test(cleanLine);

  if (isCoreFormula) {
    return {
      formulaText: cleanLine,
      category: 'physics',
      title: 'Formula & Law'
    };
  }

  return null;
}

export interface FormulaCalloutBoxProps {
  formula: string;
  title?: string;
  category?: 'chemistry' | 'physics' | 'math' | 'general';
  isMidnight?: boolean;
}

export const FormulaCalloutBox: React.FC<FormulaCalloutBoxProps> = ({
  formula,
  title = 'Formula',
  category = 'general',
  isMidnight = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const isChem = category === 'chemistry';
  const displayTitle = title || (isChem ? 'Chemical Equation' : 'Formula / Law');
  const icon = isChem ? '🧪' : category === 'physics' ? '⚡' : '📐';

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanLatexMath(formula));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-3.5 mx-auto w-full max-w-xl rounded-2xl border transition-all overflow-hidden ${
        isChem
          ? isMidnight
            ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/60 border-emerald-500/40 text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
            : 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 border-2 border-emerald-300 text-emerald-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]'
          : isMidnight
            ? 'bg-gradient-to-br from-slate-900/90 via-indigo-950/60 to-slate-900/90 border-indigo-500/40 text-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.18)]'
            : 'bg-gradient-to-br from-indigo-50/95 via-white to-sky-50/85 border-2 border-indigo-200 text-indigo-950 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.18)]'
      }`}
    >
      {/* Box Header Bar */}
      <div
        className={`px-4 py-2 flex items-center justify-between border-b ${
          isChem
            ? isMidnight ? 'border-emerald-500/25 bg-emerald-950/40' : 'border-emerald-100 bg-emerald-50/80'
            : isMidnight ? 'border-indigo-500/25 bg-indigo-950/40' : 'border-indigo-100 bg-indigo-50/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 tracking-wider ${
              isChem
                ? 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/40'
            }`}
          >
            <span>{icon}</span>
            <span>{displayTitle}</span>
          </span>
          <span className="text-[10px] opacity-60 font-semibold tracking-wide">
            CBSE Standard
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-[10px] opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 font-bold px-2 py-0.5 rounded hover:bg-slate-500/10 cursor-pointer"
          title="Copy formula text"
        >
          {copied ? <span className="text-emerald-500 font-bold">✓ Copied</span> : <span>Copy</span>}
        </button>
      </div>

      {/* Main Formula Body */}
      <div className="p-4 sm:p-5 flex items-center justify-center text-center overflow-x-auto select-all">
        <div
          className={`text-sm sm:text-base md:text-lg font-bold tracking-wide ${
            isChem
              ? isMidnight ? 'text-emerald-200' : 'text-emerald-900'
              : isMidnight ? 'text-indigo-200' : 'text-indigo-950'
          }`}
        >
          <MathExpression expression={formula} isBlock={true} isMidnight={isMidnight} />
        </div>
      </div>
    </div>
  );
};

/**
 * Main FormattedMessage component:
 * 1. Eliminates raw "$" signs everywhere.
 * 2. Replaces ugly "###" with unique, vibrant heading badges (◈ Step 1, ✦ Concept).
 * 3. Renders REAL vertical fractions (numerator over denominator with fraction bar).
 * 4. Automatically renders geometric figures (e.g. BPT Theorem triangle with DE || BC and altitudes).
 * 5. Boxes ALL formulas, chemical reactions, physical laws, and equations in dedicated highlight containers!
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  content,
  isMidnight = false,
}) => {
  if (!content) return null;

  // Check if content proves or explains BPT / Thales theorem, Pythagoras, etc.
  const lowerContent = content.toLowerCase();
  const shouldAutoInjectBpt = 
    (lowerContent.includes('basic proportionality theorem') || 
     lowerContent.includes('thales theorem') || 
     (lowerContent.includes('bpt') && lowerContent.includes('triangle'))) &&
    !content.includes('[DIAGRAM:');

  const shouldAutoInjectPythagoras = 
    (lowerContent.includes('pythagoras theorem') || lowerContent.includes('pythagorean theorem')) &&
    !content.includes('[DIAGRAM:');

  const shouldAutoInjectCircle = 
    (lowerContent.includes('tangents from external point') || lowerContent.includes('theorem 10.2')) &&
    !content.includes('[DIAGRAM:');

  const shouldAutoInjectStomata = 
    (lowerContent.includes('stomata') || lowerContent.includes('stomatal pore') || lowerContent.includes('guard cell')) &&
    !content.includes('[DIAGRAM:');

  const cleanedContent = cleanLatexMath(content);
  const lines = cleanedContent.split('\n');

  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;
  let hasInjectedDiagram = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2.5 pl-2 space-y-1.5 list-decimal list-inside">
            {currentListItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2.5 space-y-2">
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
      isNumberedList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Explicit Diagram tags e.g. [DIAGRAM:BPT_TRIANGLE]
    const diagramMatch = line.match(/\[DIAGRAM:([A-Za-z0-9_]+)\]/);
    if (diagramMatch) {
      flushList();
      elements.push(
        <TheoremDiagram key={`diag-${i}`} type={diagramMatch[1]} isMidnight={isMidnight} />
      );
      hasInjectedDiagram = true;
      continue;
    }

    // 2. Formula, Chemical Reaction & Equation callouts (Always in a Box!)
    const detectedFormula = detectFormulaLine(rawLine);
    if (detectedFormula) {
      flushList();
      elements.push(
        <FormulaCalloutBox
          key={`eq-${i}`}
          formula={detectedFormula.formulaText}
          title={detectedFormula.title}
          category={detectedFormula.category}
          isMidnight={isMidnight}
        />
      );
      continue;
    }

    // 3. Unique Heading Symbol - NEVER use raw "###"!
    // Matches "### 1. Title", "## Title", "# Title", "✦ Step 1: ...", "◈ Step 2: ...", "★ ...", "▶ ..."
    const isHashHeader = line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ');
    const isSymbolHeader = line.startsWith('✦ ') || line.startsWith('◈ ') || line.startsWith('★ ') || line.startsWith('▶ ');

    if (isHashHeader || isSymbolHeader) {
      flushList();
      let rawHeader = isHashHeader 
        ? line.replace(/^#{1,3}\s+/, '').trim()
        : line.replace(/^[✦◈★▶]\s*/, '').trim();
      
      // Determine emblem symbol
      const symbolEmblem = line.startsWith('✦') ? '✦' : line.startsWith('◈') ? '◈' : line.startsWith('★') ? '★' : line.startsWith('▶') ? '▶' : '◈';

      // Check if it's numbered like "1. Make NCERT..." or "Step 1: ..."
      const stepMatch = rawHeader.match(/^(\d+)\.\s*(.*)$/) || rawHeader.match(/^Step\s*(\d+)[:.]\s*(.*)$/i);
      const stepNum = stepMatch ? stepMatch[1] : null;
      const cleanHeaderTitle = stepMatch ? (stepMatch[2] ? `Step ${stepMatch[1]}: ${stepMatch[2]}` : rawHeader) : rawHeader;

      elements.push(
        <div
          key={`h-${i}`}
          className={`mt-5 mb-2.5 pt-3 border-t first:mt-0 first:pt-0 first:border-t-0 ${
            isMidnight ? 'border-slate-700/60' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* Unique Decorative Jewel Heading Badge */}
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${
                stepNum
                  ? 'bg-gradient-to-tr from-indigo-600 to-sky-500 text-white'
                  : 'bg-gradient-to-tr from-violet-600 to-pink-500 text-white'
              }`}
            >
              {stepNum ? stepNum : symbolEmblem}
            </span>

            <span
              className={`text-sm md:text-base font-extrabold tracking-tight ${
                isMidnight ? 'text-white' : 'text-slate-900'
              }`}
            >
              {renderInlineRichText(cleanHeaderTitle, isMidnight)}
            </span>
          </div>
        </div>
      );

      // If this is the BPT theorem and we haven't injected the diagram yet, place it right after the first step/introduction!
      if (!hasInjectedDiagram && shouldAutoInjectBpt && (stepNum === '1' || i < 4)) {
        elements.push(<TheoremDiagram key="auto-bpt-diag" type="BPT_TRIANGLE" isMidnight={isMidnight} />);
        hasInjectedDiagram = true;
      }
      continue;
    }

    // 4. Bullet Points (* item or - item)
    const bulletMatch = rawLine.match(/^(\s*)([*•-])\s+(.*)$/);
    if (bulletMatch) {
      if (isNumberedList) flushList();
      isNumberedList = false;

      const indent = bulletMatch[1].length;
      const bulletContent = bulletMatch[3];

      currentListItems.push(
        <li
          key={`li-${i}`}
          style={{ marginLeft: indent > 0 ? `${indent * 8}px` : undefined }}
          className="flex items-start gap-2.5 text-xs md:text-sm leading-relaxed"
        >
          {/* Unique bullet marker dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
              isMidnight ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]' : 'bg-indigo-600'
            }`}
          />
          <div className="flex-1">
            {renderInlineRichText(bulletContent, isMidnight)}
          </div>
        </li>
      );
      continue;
    }

    // 5. Numbered list (1. item, 2. item)
    const numberedMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!isNumberedList) flushList();
      isNumberedList = true;

      const num = numberedMatch[2];
      const listContent = numberedMatch[3];

      currentListItems.push(
        <li key={`nli-${i}`} className="flex items-start gap-2.5 text-xs md:text-sm leading-relaxed">
          <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 select-none">
            {num}
          </span>
          <div className="flex-1">
            {renderInlineRichText(listContent, isMidnight)}
          </div>
        </li>
      );
      continue;
    }

    // Regular line or empty line
    flushList();

    if (line === '') {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs md:text-sm leading-relaxed">
        {renderInlineRichText(line, isMidnight)}
      </p>
    );

    // Auto-inject diagrams if not injected yet and mentioned in paragraph
    if (!hasInjectedDiagram) {
      if (shouldAutoInjectBpt && (line.includes('BPT') || line.includes('Thales') || line.includes('Basic Proportionality'))) {
        elements.push(<TheoremDiagram key="auto-bpt-diag" type="BPT_TRIANGLE" isMidnight={isMidnight} />);
        hasInjectedDiagram = true;
      } else if (shouldAutoInjectPythagoras && line.includes('Pythagoras')) {
        elements.push(<TheoremDiagram key="auto-pyth-diag" type="PYTHAGORAS" isMidnight={isMidnight} />);
        hasInjectedDiagram = true;
      } else if (shouldAutoInjectCircle && (line.includes('Tangent') || line.includes('10.2'))) {
        elements.push(<TheoremDiagram key="auto-circle-diag" type="CIRCLE_TANGENTS" isMidnight={isMidnight} />);
        hasInjectedDiagram = true;
      } else if (shouldAutoInjectStomata && (line.toLowerCase().includes('stomata') || line.toLowerCase().includes('guard cell') || line.toLowerCase().includes('stomatal'))) {
        elements.push(<TheoremDiagram key="auto-stomata-diag" type="STOMATA" isMidnight={isMidnight} />);
        hasInjectedDiagram = true;
      }
    }
  }

  // Flush any remaining list items
  flushList();

  return <div className="space-y-0.5">{elements}</div>;
};

/**
 * Renders inline text, handling:
 * - Bold (**keyword**)
 * - Italics (*tip*)
 * - Math expressions with real fractions (\frac{...}{...} or [MATH]...[/MATH])
 * - Code (`code`)
 */
function renderInlineRichText(text: string, isMidnight: boolean): React.ReactNode {
  if (!text) return null;

  // Tokenize regex:
  // 1. Math tag: \[MATH\].*?\[/MATH\]
  // 2. Inline fraction: \\frac\{[^}]+\}\{[^}]+\}
  // 3. Bold: \*\*[^*]+?\*\*
  // 4. Code: `[^`]+?`
  // 5. Italic: \*[^*]+?\*
  const tokenRegex = /(\[MATH\].*?\[\/MATH\]|\\frac\{[^}]+\}\{[^}]+\}|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g;
  const tokens = text.split(tokenRegex);

  return (
    <>
      {tokens.map((token, idx) => {
        if (!token) return null;

        // Math tag: [MATH]...[/MATH]
        if (token.startsWith('[MATH]') && token.endsWith('[/MATH]')) {
          const expr = token.replace('[MATH]', '').replace('[/MATH]', '');
          return <MathExpression key={idx} expression={expr} isMidnight={isMidnight} />;
        }

        // Raw \frac{num}{den}
        if (token.startsWith('\\frac{') && token.endsWith('}')) {
          return <MathExpression key={idx} expression={token} isMidnight={isMidnight} />;
        }

        // Bold: **text**
        if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
          const boldText = token.slice(2, -2);
          return (
            <strong
              key={idx}
              className={`font-extrabold ${
                isMidnight ? 'text-white' : 'text-slate-900 font-bold'
              }`}
            >
              {boldText}
            </strong>
          );
        }

        // Inline Code: `code`
        if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
          const codeText = token.slice(1, -1);
          return (
            <code
              key={idx}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                isMidnight
                  ? 'bg-slate-900 border border-slate-700 text-sky-300'
                  : 'bg-slate-200/80 text-indigo-900 border border-slate-300'
              }`}
            >
              {codeText}
            </code>
          );
        }

        // Italic: *text* (single asterisk)
        if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
          const italicText = token.slice(1, -1);
          return (
            <em
              key={idx}
              className={`italic font-medium ${
                isMidnight ? 'text-indigo-300' : 'text-indigo-700'
              }`}
            >
              {italicText}
            </em>
          );
        }

        // Plain text token: check if it contains any simple inline fraction like "1/2" or "AD/DB"
        return <span key={idx}>{token}</span>;
      })}
    </>
  );
}
