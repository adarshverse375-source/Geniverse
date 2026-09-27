import { CBSE_CHAPTERS } from '../data';
import { ChatRoleChoice, SubjectType } from '../types';

/**
 * Intelligent client-side CBSE study engine.
 * Ensures students on any device (offline, spotty cellular, school firewall,
 * cross-device preview) receive immediate, accurate, curriculum-aligned
 * step-by-step guidance without ever seeing a broken connection screen.
 */
export function generateClientCurriculumResponse(
  query: string,
  subject: SubjectType,
  chapterName: string,
  role: ChatRoleChoice = 'general'
): string {
  const qLower = query.toLowerCase().trim();

  // Find most relevant chapter in CBSE curriculum data
  const currentChapter =
    CBSE_CHAPTERS.find(
      (c) =>
        c.name.toLowerCase() === chapterName.toLowerCase() &&
        c.subject.toLowerCase() === subject.toLowerCase()
    ) ||
    CBSE_CHAPTERS.find((c) => c.name.toLowerCase() === chapterName.toLowerCase()) ||
    CBSE_CHAPTERS.find((c) => c.subject.toLowerCase() === subject.toLowerCase()) ||
    CBSE_CHAPTERS[0];

  // 1. Check if user asked to draw or view an educational diagram
  const wantsDiagram =
    qLower.includes('draw') ||
    qLower.includes('diagram') ||
    qLower.includes('sketch') ||
    qLower.includes('show picture') ||
    qLower.includes('illustrate') ||
    qLower.includes('stomata');

  let diagramTag = '';
  if (wantsDiagram || qLower.includes('stomata') || qLower.includes('guard cell')) {
    if (qLower.includes('stomata') || qLower.includes('guard cell')) {
      diagramTag = '\n\n[DIAGRAM:STOMATA]\n';
    } else if (qLower.includes('bpt') || qLower.includes('thales') || qLower.includes('triangle')) {
      diagramTag = '\n\n[DIAGRAM:BPT_TRIANGLE]\n';
    } else if (qLower.includes('pythagoras')) {
      diagramTag = '\n\n[DIAGRAM:PYTHAGORAS]\n';
    } else if (qLower.includes('tangent') || qLower.includes('circle')) {
      diagramTag = '\n\n[DIAGRAM:CIRCLE_TANGENTS]\n';
    } else if (qLower.includes('height') || qLower.includes('distance') || qLower.includes('trigonometry')) {
      diagramTag = '\n\n[DIAGRAM:TRIGONOMETRY_TRIANGLE]\n';
    }
  }

  // 2. Check for exact flashcard match
  const matchedFlashcard = currentChapter.flashcards?.find((f) => {
    const fLower = f.front.toLowerCase();
    const words = qLower.split(/\s+/).filter((w) => w.length > 3);
    const matchCount = words.filter((w) => fLower.includes(w)).length;
    return matchCount >= 2 || fLower.includes(qLower) || qLower.includes(fLower);
  });

  // 3. Check for high-yield question match
  const matchedQuestion = currentChapter.highYieldQuestions?.find((hq) => {
    const textLower = hq.questionText.toLowerCase();
    const words = qLower.split(/\s+/).filter((w) => w.length > 3);
    const matchCount = words.filter((w) => textLower.includes(w)).length;
    return matchCount >= 2;
  });

  // Role-specific introductory styling
  let roleHeader = '✦ Brights CBSE Study Mentor:';
  let roleTip = '💡 Board Exam Tip: Underline key scientific terms and highlight final numerical answers.';

  if (role === 'examiner') {
    roleHeader = '✦ Senior Board Examiner Marking Scheme Analysis:';
    roleTip =
      '💡 Examiner Marking Tip:\n• Exact keyword marks: +1 mark for technical terms and correct units.\n• Method marks: +1 mark for formula and step-by-step substitution.\n• Pitfall to avoid: Missing SI units or incomplete concluding statements will forfeit 0.5 to 1 mark.';
  } else if (role === 'stem') {
    roleHeader = '✦ STEM & Derivations Master:';
    roleTip =
      '💡 STEM Focus: Always state the fundamental theorem or law, define all variables with units, and show algebraic substitutions step-by-step.';
  } else if (role === 'speed_drill') {
    roleHeader = '✦ Rapid Recall Drill Master:';
    roleTip =
      '💡 Rapid Drill Check: Can you recall the primary formula and its unit without looking? Active recall builds high test endurance!';
  } else if (role === 'humanities') {
    roleHeader = '✦ Social Science & Literature Master:';
    roleTip =
      '💡 Board Rubric Tip: Structure 3-mark & 5-mark subjective answers chronologically with clear headings and cause-effect linkages.';
  }

  // If a direct flashcard was matched
  if (matchedFlashcard) {
    return `${roleHeader}

★ Direct NCERT Concept:
${matchedFlashcard.back}

▶ Detailed Academic Context:
${matchedFlashcard.extraInfo || currentChapter.keySummary[0]}
${diagramTag}
★ Key Syllabus Takeaways:
${currentChapter.keySummary.slice(0, 2).map((s) => `• ${s}`).join('\n')}

${roleTip}`;
  }

  // If a high-yield question was matched
  if (matchedQuestion) {
    const correctOpt = matchedQuestion.options[matchedQuestion.correctIndex];
    return `${roleHeader}

★ Question Analysis:
"${matchedQuestion.questionText}"

✦ Correct Answer:
**${correctOpt}**

▶ Step-by-Step Educational Explanation:
${matchedQuestion.explanation}
${diagramTag}
${roleTip}`;
  }

  // General concept explanation based on current chapter
  const summaries = currentChapter.keySummary.slice(0, 3).map((s) => `• ${s}`).join('\n');
  const formulas = currentChapter.formulasOrFacts.slice(0, 2).map((f) => `• ${f}`).join('\n');

  return `${roleHeader}

Here is the structured CBSE Class 10 explanation for **${currentChapter.name}** (${currentChapter.subject}):

★ Core NCERT Concepts & Definitions:
${summaries}

★ High-Yield Board Exam Essentials:
${formulas}
${diagramTag}
${roleTip}

*(You can ask specific questions like numerical solutions, proofs, definitions, or ask me to "draw a diagram" for visual concepts!)*`;
}
