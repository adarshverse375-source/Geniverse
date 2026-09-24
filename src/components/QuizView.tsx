import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  RotateCcw, 
  Cpu, 
  PlusCircle, 
  FolderKanban, 
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Question, CustomQuestion } from '../types';
import { MathText } from './MathText';

interface QuizViewProps {
  isMidnight: boolean;
  activeQuestions: Question[];
  currentQuestionIdx: number;
  selectedOption: number | null;
  isAnswerSubmitted: boolean;
  quizScore: number;
  quizFinished: boolean;
  aiQuizLoading: boolean;
  aiQuizError: string | null;
  customQuestionsCount: number;
  subjectName: string;
  chapterName: string;
  subjectColor?: string;
  onSelectOption: (idx: number) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion?: () => void;
  onRestartQuiz: () => void;
  onGenerateAIQuiz: () => void;
  onOpenAddQuestion: () => void;
  onOpenManageQuestions: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  isMidnight,
  activeQuestions,
  currentQuestionIdx,
  selectedOption,
  isAnswerSubmitted,
  quizScore,
  quizFinished,
  aiQuizLoading,
  aiQuizError,
  customQuestionsCount,
  subjectName,
  chapterName,
  subjectColor = '#0284c7',
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onRestartQuiz,
  onGenerateAIQuiz,
  onOpenAddQuestion,
  onOpenManageQuestions,
}) => {
  const [hintOpen, setHintOpen] = useState(false);

  // Count user incorrect answers so far
  // Total attempted questions up to current
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIdx];

  // Number of incorrect answers submitted so far
  // We can track this or calculate from: current attempted count - current correct score
  // When isAnswerSubmitted on current question:
  const questionsAttempted = isAnswerSubmitted ? currentQuestionIdx + 1 : currentQuestionIdx;
  const incorrectCount = Math.max(0, questionsAttempted - quizScore);
  const correctCount = quizScore;

  // Derive an intuitive hint if available, or generate from explanation
  const getHintText = (q: Question) => {
    if (!q) return '';
    // If the explanation has a formula or starting cue, extract the first sentence
    const firstSentence = q.explanation.split('.')[0];
    return firstSentence ? `${firstSentence}.` : 'Consider the core definition or formula related to this chapter.';
  };

  return (
    <section 
      aria-label="Interactive Board Quiz"
      className={`rounded-3xl transition-all relative overflow-hidden border ${
        isMidnight 
          ? 'bg-[#181a1f] text-slate-100 border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.4)]' 
          : 'bg-[#f4f6f8] text-slate-900 border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Quiz Top Action Bar: Subject, Custom Questions & AI Generator */}
      <div className={`px-6 sm:px-8 pt-5 pb-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isMidnight ? 'border-slate-800/80 bg-[#14161a]' : 'border-slate-200 bg-[#edf0f4]'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span 
            className="w-2.5 h-2.5 rounded-full shrink-0" 
            style={{ backgroundColor: subjectColor }} 
          />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold truncate">
              {chapterName} <span className="opacity-60 text-xs font-normal">• {subjectName}</span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddQuestion}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 ${
              isMidnight 
                ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Add your custom board question"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">Add Question</span>
          </button>

          {customQuestionsCount > 0 && (
            <button
              onClick={onOpenManageQuestions}
              className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                isMidnight 
                  ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">My Questions</span> ({customQuestionsCount})
            </button>
          )}

          <button
            disabled={aiQuizLoading}
            onClick={onGenerateAIQuiz}
            className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
              isMidnight
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            } ${aiQuizLoading ? 'opacity-60 cursor-wait' : ''}`}
          >
            <Cpu className={`w-3.5 h-3.5 ${aiQuizLoading ? 'animate-spin' : ''}`} />
            <span>{aiQuizLoading ? 'Generating...' : 'AI New Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {aiQuizError && (
        <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
          {aiQuizError}
        </div>
      )}

      {!quizFinished ? (
        totalQuestions > 0 ? (
          <div className="p-6 sm:p-8 md:p-10 flex flex-col">
            
            {/* Top Gemini-Style Header: Segmented Progress Bar + Question Number + Counters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              {/* Segmented Progress Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-1 max-w-sm sm:max-w-md">
                {activeQuestions.map((_, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isPassed = idx < currentQuestionIdx;
                  return (
                    <div
                      key={idx}
                      className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        isPassed 
                          ? isMidnight ? 'bg-slate-300' : 'bg-slate-700'
                          : isCurrent
                            ? isMidnight ? 'bg-white shadow-xs' : 'bg-slate-900'
                            : isMidnight ? 'bg-slate-800' : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Counter badges: 3 / 15, Cross badge, Check badge */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-sans">
                <span className="text-xs sm:text-sm font-semibold opacity-70 tracking-tight mr-1">
                  {currentQuestionIdx + 1} / {totalQuestions}
                </span>

                {/* Incorrect count bubble (Red/Pink) */}
                <div className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold text-xs ${
                  isMidnight 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}>
                  <X className="w-3 h-3 stroke-[2.5]" />
                  <span>{incorrectCount}</span>
                </div>

                {/* Correct count bubble (Green) */}
                <div className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold text-xs ${
                  isMidnight 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>{correctCount}</span>
                </div>
              </div>
            </div>

            {/* Question Title & Subtext */}
            <div className="mb-6 sm:mb-8">
              <span className={`text-xs sm:text-sm font-bold block mb-2 tracking-tight ${
                isMidnight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Question {currentQuestionIdx + 1}
              </span>
              <h3 className={`text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-normal ${
                isMidnight ? 'text-slate-100' : 'text-slate-900'
              }`}>
                <MathText text={currentQuestion.questionText} isMidnight={isMidnight} />
              </h3>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3 sm:gap-3.5 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                // Gemini Quiz styles:
                // Unsubmitted unselected: dark card (bg-[#212328] or white)
                // Unsubmitted selected: highlighted outline
                // Submitted correct: green tag "✓ Correct answer" + detailed explanation below
                // Submitted incorrect: red tag "✕ Incorrect" + custom feedback / explanation
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectOption(idx)}
                    className={`group rounded-2xl p-4 sm:p-4.5 transition-all text-left ${
                      !isAnswerSubmitted ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isMidnight
                        ? isAnswerSubmitted
                          ? isCorrect
                            ? 'bg-[#1b2220] border border-emerald-500/40 text-slate-100 shadow-[0_2px_16px_rgba(16,185,129,0.08)]'
                            : isSelected
                              ? 'bg-[#241c20] border border-rose-500/40 text-slate-200'
                              : 'bg-[#1e2025] border border-transparent text-slate-400 opacity-60'
                          : isSelected
                            ? 'bg-[#252830] border-2 border-indigo-400 text-white shadow-sm'
                            : 'bg-[#1f2126] hover:bg-[#25282e] border border-transparent hover:border-slate-700/60 text-slate-200'
                        : isAnswerSubmitted
                          ? isCorrect
                            ? 'bg-[#ecfdf5] border-2 border-emerald-500 text-slate-900 shadow-sm'
                            : isSelected
                              ? 'bg-[#fff1f2] border-2 border-rose-400 text-slate-900'
                              : 'bg-white/60 border border-slate-200 text-slate-400 opacity-60'
                          : isSelected
                            ? 'bg-white border-2 border-indigo-600 text-slate-900 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
                    }`}
                  >
                    {/* Option Header Row: Letter + Math Text + Tag (Your answer / Incorrect / Correct) */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-baseline gap-3 flex-1 min-w-0">
                        <span className={`font-bold text-sm sm:text-base shrink-0 ${
                          isSelected ? 'text-indigo-400 dark:text-indigo-400 font-extrabold' : 'opacity-80'
                        }`}>
                          {optionLetter}.
                        </span>
                        
                        <div className="text-sm sm:text-base font-normal min-w-0">
                          <MathText text={option} isMidnight={isMidnight} />
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <span className="text-xs opacity-65 font-normal ml-2 tracking-tight">
                              (Your answer)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gemini Status Pills */}
                      {isAnswerSubmitted && (
                        <div className="shrink-0 flex items-center">
                          {isCorrect ? (
                            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Correct answer</span>
                            </div>
                          ) : isSelected ? (
                            <div className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 dark:text-rose-300 border border-rose-500/40 text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Incorrect</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Gemini Explanation directly under the corresponding card */}
                    {isAnswerSubmitted && isCorrect && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-emerald-500/20 text-xs sm:text-sm opacity-90 leading-relaxed font-normal"
                      >
                        <MathText text={currentQuestion.explanation} isMidnight={isMidnight} />
                      </motion.div>
                    )}

                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-rose-500/20 text-xs sm:text-sm text-rose-300 dark:text-rose-200/90 leading-relaxed font-normal"
                      >
                        Review the formula and algebraic sign convention. See the correct solution marked below.
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint Accordion (Available before/after answer) */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => setHintOpen(prev => !prev)}
                className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isMidnight ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Hint</span>
                {hintOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {hintOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-2 p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isMidnight 
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300' 
                        : 'bg-slate-100/90 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{getHintText(currentQuestion)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gemini Footer: Back & Next / Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/80">
              {/* Back button */}
              {currentQuestionIdx > 0 && onPreviousQuestion && (
                <button
                  type="button"
                  onClick={onPreviousQuestion}
                  className={`py-2.5 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    isMidnight 
                      ? 'bg-[#212328] hover:bg-[#2c2f36] text-slate-200' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  Back
                </button>
              )}

              {/* Submit or Next */}
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={onSubmitAnswer}
                  className={`py-2.5 px-6 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                    selectedOption === null 
                      ? isMidnight 
                        ? 'bg-[#26282e] text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#2b58ef] hover:bg-[#2149d4] text-white active:scale-95'
                  }`}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNextQuestion}
                  className="py-2.5 px-6 rounded-full text-xs sm:text-sm font-semibold bg-[#2b58ef] hover:bg-[#2149d4] text-white shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>{currentQuestionIdx === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <p className="text-sm opacity-60">No board questions loaded for this module.</p>
          </div>
        )
      ) : (
        /* Results Sheet (Gemini Polished Finish) */
        <div className="py-12 px-6 sm:px-10 text-center flex flex-col items-center gap-5">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
            quizScore / totalQuestions >= 0.7 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
              : 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
          }`}>
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Quiz Completed!
            </h3>
            <p className="text-sm opacity-75 mt-1.5 max-w-md mx-auto">
              You correctly solved <strong className="text-emerald-500">{quizScore}</strong> out of <strong>{totalQuestions}</strong> questions in {chapterName}.
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs font-bold py-1 px-3 rounded-full bg-slate-200 dark:bg-slate-800">
                Score: {Math.round((quizScore / totalQuestions) * 100)}%
              </span>
              <span className="text-xs font-bold py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +{quizScore * 10} XP Earned
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={onRestartQuiz}
              className={`py-2.5 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isMidnight 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={onGenerateAIQuiz}
              className="py-2.5 px-5 rounded-full text-xs sm:text-sm font-semibold bg-[#2b58ef] hover:bg-[#2149d4] text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Practice Fresh MCQs with AI</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
