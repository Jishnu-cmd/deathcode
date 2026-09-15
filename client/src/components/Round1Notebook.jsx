import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { submitMcqAnswer } from '../services/api';
import { sounds } from '../services/audio';

export default function Round1Notebook({
  participant,
  questions,
  onAnswered,
  onAdvanceRound
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const activeQ = questions[currentIndex];

  useEffect(() => {
    if (activeQ) {
      setSelectedOption(activeQ.selected_option || '');
      setFeedback(null);
    }
  }, [currentIndex, activeQ]);

  // Keyboard shortcut listener for A, B, C, D and navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !activeQ?.is_answered) {
        setSelectedOption(key);
        sounds.playKey();
      }
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        sounds.playKey();
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        sounds.playKey();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeQ, questions.length]);

  const handleSubmitAnswer = async () => {
    if (!selectedOption || activeQ?.is_answered || submitting) return;

    setSubmitting(true);
    try {
      const res = await submitMcqAnswer(
        participant.reg_id,
        activeQ.participant_question_id,
        selectedOption
      );

      if (res.is_correct) {
        sounds.playSuccess();
      } else {
        sounds.playError();
      }

      setFeedback(res);
      onAnswered(activeQ.participant_question_id, selectedOption, res);
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeQ) {
    return (
      <div className="p-12 text-center font-mono text-gray-400">
        Loading Round 1 questions...
      </div>
    );
  }

  const answeredCount = questions.filter((q) => q.is_answered).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-death-border">
        <div>
          <span className="text-xs font-mono text-kira-red uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            ROUND 1 — 12 MINUTES DURATION
          </span>
          <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-crimson">
            THE NOTEBOOK
          </h1>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-gray-400">
            PROGRESS: <span className="text-white font-bold">{answeredCount} / {questions.length}</span>
          </div>
          <div className="w-32 bg-death-card h-2 rounded-full overflow-hidden border border-death-border">
            <div
              className="bg-kira-red h-full transition-all duration-300 shadow-crimson"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Main Question Area (Notebook Page) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="notebook-paper p-6 sm:p-8 rounded-xl border border-death-border/80 shadow-2xl relative">
            
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-kira-red/40 text-kira-red font-bold">
                QUESTION #{activeQ.order_num} of {questions.length}
              </span>
              <span className="text-gray-400">
                CATEGORY: <strong className="text-gray-200">{activeQ.category}</strong> ({activeQ.difficulty.toUpperCase()})
              </span>
            </div>

            {/* Question Prompt */}
            <h2 className="text-lg sm:text-xl font-mono text-white font-semibold leading-relaxed mb-4">
              {activeQ.question_text}
            </h2>

            {/* Code Snippet Box (if provided) */}
            {activeQ.code_snippet && (
              <div className="mb-6 p-4 rounded-lg bg-black/80 border border-death-border font-mono text-sm text-green-400 overflow-x-auto shadow-inner">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SQL SNIPPET</div>
                <pre className="whitespace-pre-wrap">{activeQ.code_snippet}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {[
                { letter: 'A', text: activeQ.option_a },
                { letter: 'B', text: activeQ.option_b },
                { letter: 'C', text: activeQ.option_c },
                { letter: 'D', text: activeQ.option_d }
              ].map((opt) => {
                const isSelected = selectedOption === opt.letter;
                const isAnswered = activeQ.is_answered;
                const isChosenAnswer = activeQ.selected_option === opt.letter;

                let borderClass = 'border-death-border hover:border-gray-500';
                let bgClass = 'bg-death-card/60 hover:bg-death-card';

                if (isSelected && !isAnswered) {
                  borderClass = 'border-kira-red shadow-crimson';
                  bgClass = 'bg-red-950/30';
                }

                if (isAnswered) {
                  if (isChosenAnswer) {
                    if (activeQ.is_correct) {
                      borderClass = 'border-green-500 shadow-lg shadow-green-500/20';
                      bgClass = 'bg-green-950/40 text-green-200';
                    } else {
                      borderClass = 'border-kira-red shadow-crimson';
                      bgClass = 'bg-red-950/50 text-red-200';
                    }
                  } else {
                    bgClass = 'bg-black/30 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.letter}
                    disabled={isAnswered}
                    onClick={() => {
                      sounds.playKey();
                      setSelectedOption(opt.letter);
                    }}
                    className={`w-full p-4 rounded-xl border text-left font-mono transition-all flex items-start gap-3.5 ${borderClass} ${bgClass}`}
                  >
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-kira-red text-white border-kira-red' : 'bg-black/70 text-gray-400 border-death-border'
                    }`}>
                      {opt.letter}
                    </span>
                    <span className="text-sm pt-0.5 leading-snug break-words">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback / Explanation Box */}
            {(feedback || activeQ.is_answered) && (
              <div className={`p-4 rounded-xl border mb-6 font-mono text-xs leading-relaxed ${
                activeQ.is_correct ? 'bg-green-950/30 border-green-700/60 text-green-300' : 'bg-red-950/30 border-red-700/60 text-red-300'
              }`}>
                <div className="font-bold uppercase flex items-center gap-1.5 mb-1 text-sm">
                  {activeQ.is_correct ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-kira-red" />}
                  <span>{activeQ.is_correct ? 'JUDGMENT CORRECT (+1 PT)' : 'INCORRECT SUBMISSION (0 PTS)'}</span>
                </div>
                <p className="text-gray-300 mt-1">
                  {feedback?.explanation || "Recorded in the Task Force archive."}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-death-border/50">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  sounds.playKey();
                  setCurrentIndex((i) => i - 1);
                }}
                className="px-4 py-2 rounded-lg bg-death-card border border-death-border hover:border-gray-500 text-gray-300 font-mono text-xs flex items-center gap-1.5 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>PREVIOUS</span>
              </button>

              {!activeQ.is_answered ? (
                <button
                  disabled={!selectedOption || submitting}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 rounded-lg bg-kira-red hover:bg-red-700 text-white font-mono font-bold text-xs tracking-wider shadow-crimson flex items-center gap-2 disabled:opacity-40"
                >
                  <span>{submitting ? 'RECORDING...' : 'CONFIRM SELECTION'}</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-mono text-gray-400 italic">
                  Answer recorded
                </span>
              )}

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => {
                  sounds.playKey();
                  setCurrentIndex((i) => i + 1);
                }}
                className="px-4 py-2 rounded-lg bg-death-card border border-death-border hover:border-gray-500 text-gray-300 font-mono text-xs flex items-center gap-1.5 disabled:opacity-30"
              >
                <span>NEXT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {answeredCount === questions.length && onAdvanceRound && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border-2 border-kira-red flex flex-col sm:flex-row items-center justify-between gap-4 shadow-crimson animate-pulse">
                <div>
                  <div className="font-mono text-xs text-kira-red font-bold uppercase tracking-wider">
                    ROUND 1 COMPLETE
                  </div>
                  <div className="font-mono text-sm text-white">
                    All {questions.length} Notebook queries answered. Ready to proceed to Kira's Code?
                  </div>
                </div>
                <button
                  onClick={onAdvanceRound}
                  className="px-6 py-3 rounded-lg bg-kira-red hover:bg-red-700 text-white font-mono font-bold text-xs tracking-widest uppercase shadow-crimson flex items-center gap-2 shrink-0 transition-all cursor-pointer"
                >
                  <span>PROCEED TO ROUND 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Col: Question Navigation Grid */}
        <div className="space-y-6">
          <div className="bg-death-card border border-death-border p-5 rounded-xl shadow-xl">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-kira-red" />
              QUESTION MATRIX
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                let bg = 'bg-death-surface border-death-border text-gray-400';
                if (q.is_answered) {
                  bg = q.is_correct
                    ? 'bg-green-950/60 border-green-600 text-green-300'
                    : 'bg-red-950/60 border-kira-red text-red-300';
                }
                if (isCurrent) {
                  bg += ' ring-2 ring-kira-red font-bold text-white';
                }

                return (
                  <button
                    key={q.question_id}
                    onClick={() => {
                      sounds.playKey();
                      setCurrentIndex(idx);
                    }}
                    className={`h-10 rounded-lg border text-xs font-mono flex items-center justify-center transition-all ${bg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-death-border text-[11px] font-mono text-gray-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Correct Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-kira-red" />
                <span>Incorrect Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-500" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          {/* Lore card */}
          <div className="p-4 rounded-xl bg-black/40 border border-death-border text-xs font-mono text-gray-400 leading-relaxed italic">
            "The human whose name is written in this notebook shall die. Solve each SQL projection with precision, or risk early elimination."
          </div>
        </div>

      </div>
    </div>
  );
}
