import React, { useState, useEffect } from 'react';
import { Terminal, Eye, Apple, CheckCircle, XCircle, ArrowRight, ArrowLeft, AlertCircle, HelpCircle } from 'lucide-react';
import { submitMcqAnswer, askLHint, activateRyukDeal } from '../services/api';
import { sounds } from '../services/audio';

export default function Round2KirasCode({
  participant,
  questions,
  onAnswered,
  onUpdateParticipant,
  onAdvanceRound
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lHintText, setLHintText] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [ryukLoading, setRyukLoading] = useState(false);
  const [ryukDealMessage, setRyukDealMessage] = useState(null);

  const activeQ = questions[currentIndex];

  useEffect(() => {
    if (activeQ) {
      setSelectedOption(activeQ.selected_option || '');
      setFeedback(null);
      setLHintText(null);
    }
  }, [currentIndex, activeQ]);

  // Keyboard shortcut listener
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

  const handleAskL = async () => {
    if (participant.hint_used_r2 >= 1 || hintLoading) return;
    if (!confirm("Invoking 'ASK L' will permanently deduct 1 point from your total score in exchange for a critical syntax hint. Do you wish to proceed?")) {
      return;
    }

    setHintLoading(true);
    try {
      sounds.playBell();
      const res = await askLHint(participant.reg_id, activeQ.question_id);
      setLHintText(res.hint);
      onUpdateParticipant({ score: res.new_score, hint_used_r2: 1 });
    } catch (err) {
      alert(err.message || 'Failed to summon L');
    } finally {
      setHintLoading(false);
    }
  };

  const handleRyukDeal = async () => {
    if (participant.ryuk_deal_active === 1 || ryukLoading) return;

    setRyukLoading(true);
    try {
      sounds.playStinger();
      const res = await activateRyukDeal(participant.reg_id);
      setRyukDealMessage(res.message);
      onUpdateParticipant({ ryuk_deal_active: 1 });
    } catch (err) {
      alert(err.message || "Ryuk rejected the deal");
    } finally {
      setRyukLoading(false);
    }
  };

  if (!activeQ) {
    return (
      <div className="p-12 text-center font-mono text-gray-400">
        Loading Round 2 questions...
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
            <Terminal className="w-4 h-4" />
            ROUND 2 — 15 MINUTES DURATION
          </span>
          <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-crimson">
            KIRA'S CODE
          </h1>
        </div>

        {/* Action Powerups */}
        <div className="flex items-center gap-3">
          {/* ASK L Button */}
          <button
            onClick={handleAskL}
            disabled={participant.hint_used_r2 >= 1 || hintLoading}
            className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all ${
              participant.hint_used_r2 >= 1
                ? 'bg-black/40 border-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-l-cyan/10 border-l-cyan text-l-cyan hover:bg-l-cyan/20 shadow-l-glow animate-pulse'
            }`}
            title="Ask L for a clue (-1 Point penalty)"
          >
            <Eye className="w-4 h-4" />
            <span>{participant.hint_used_r2 >= 1 ? 'L CONSULTED' : 'ASK L (-1 PT)'}</span>
          </button>

          {/* Ryuk's Deal Button */}
          <button
            onClick={handleRyukDeal}
            disabled={participant.ryuk_deal_active === 1 || ryukLoading}
            className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all ${
              participant.ryuk_deal_active === 1
                ? 'bg-red-950/80 border-kira-red text-white shadow-crimson animate-bounce'
                : 'bg-kira-red/10 border-kira-red text-kira-red hover:bg-kira-red/20 shadow-crimson'
            }`}
            title="Ryuk's Deal: 2x points on next question, or 0 if wrong!"
          >
            <Apple className="w-4 h-4" />
            <span>{participant.ryuk_deal_active === 1 ? "RYUK DEAL ACTIVE (2X)" : "RYUK'S DEAL"}</span>
          </button>
        </div>
      </div>

      {/* Ryuk Alert Banner */}
      {participant.ryuk_deal_active === 1 && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border border-kira-red flex items-center justify-between text-xs font-mono text-white shadow-crimson animate-pulse">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-kira-red" />
            <span><strong>RYUK'S GAMBLE IN EFFECT:</strong> Next question is worth double points (+4 PTS), but wrong answer yields 0 points!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Code Terminal Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-death-surface border border-death-border p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden">
            
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-death-border text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="text-gray-400 ml-2">TERMINAL // KIRA_CORRUPTION_INSPECTOR</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-kira-red/20 text-kira-red border border-kira-red/40 font-bold">
                QUESTION #{activeQ.order_num} (+2 PTS)
              </span>
            </div>

            {/* Prompt */}
            <h2 className="text-base sm:text-lg font-mono text-white font-semibold mb-4 leading-relaxed">
              {activeQ.question_text}
            </h2>

            {/* Broken SQL Code Window */}
            {activeQ.code_snippet && (
              <div className="mb-6 p-5 rounded-lg bg-black/90 border border-kira-red/40 font-mono text-sm leading-relaxed shadow-inner overflow-x-auto">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>CORRUPTED_QUERY.SQL</span>
                  <span className="text-kira-red animate-pulse">RESTORE SYNTAX</span>
                </div>
                <pre className="text-cyan-300 whitespace-pre-wrap font-mono">{activeQ.code_snippet}</pre>
              </div>
            )}

            {/* L's Clue Reveal Card (if asked) */}
            {lHintText && (
              <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 border border-l-cyan/60 text-cyan-200 font-mono text-xs leading-relaxed shadow-l-glow flex items-start gap-3">
                <Eye className="w-5 h-5 text-l-cyan shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <strong className="block text-white uppercase tracking-wider mb-1 font-bold">L'S DEDUCTION:</strong>
                  <span>{lHintText}</span>
                </div>
              </div>
            )}

            {/* Options Grid */}
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

            {/* Post-submission Feedback */}
            {(feedback || activeQ.is_answered) && (
              <div className={`p-4 rounded-xl border mb-6 font-mono text-xs leading-relaxed ${
                activeQ.is_correct ? 'bg-green-950/30 border-green-700/60 text-green-300' : 'bg-red-950/30 border-red-700/60 text-red-300'
              }`}>
                <div className="font-bold uppercase flex items-center gap-1.5 mb-1 text-sm">
                  {activeQ.is_correct ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-kira-red" />}
                  <span>{activeQ.is_correct ? `CODE RESTORED (+${activeQ.points_awarded || 2} PTS)` : 'SYNTAX ERROR (0 PTS / -1 LIFE)'}</span>
                </div>
                <p className="text-gray-300 mt-1">
                  {feedback?.explanation || "Case archive updated."}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-death-border">
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
                  <span>{submitting ? 'EXECUTING SQL...' : 'SUBMIT CORRECTION'}</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-mono text-gray-400 italic">
                  Patch committed
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
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-black to-cyan-950/80 border-2 border-l-cyan flex flex-col sm:flex-row items-center justify-between gap-4 shadow-cyan animate-pulse">
                <div>
                  <div className="font-mono text-xs text-l-cyan font-bold uppercase tracking-wider">
                    ROUND 2 COMPLETE
                  </div>
                  <div className="font-mono text-sm text-white">
                    All {questions.length} queries reconstructed. Ready to enter L's Criminal Investigation?
                  </div>
                </div>
                <button
                  onClick={onAdvanceRound}
                  className="px-6 py-3 rounded-lg bg-l-cyan hover:bg-cyan-400 text-black font-mono font-bold text-xs tracking-widest uppercase shadow-cyan flex items-center gap-2 shrink-0 transition-all cursor-pointer"
                >
                  <span>PROCEED TO ROUND 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Col: Round 2 Info & Question Matrix */}
        <div className="space-y-6">
          <div className="bg-death-card border border-death-border p-5 rounded-xl shadow-xl">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-kira-red" />
              KIRA CODE MATRIX (8 QUESTIONS)
            </h3>

            <div className="grid grid-cols-4 gap-2">
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
                    #{idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-death-border text-[11px] font-mono text-gray-400 space-y-2">
              <div className="p-2.5 rounded bg-black/40 border border-death-border">
                <span className="text-kira-red font-bold block mb-1">RULES OF ENGAGEMENT:</span>
                <p className="text-[10px] leading-relaxed">
                  • Correct answers award <strong>+2 points</strong>.<br/>
                  • Incorrect submissions deduct <strong>1 Life</strong>.<br/>
                  • <strong>ASK L</strong> provides 1 deduction hint at -1 pt.<br/>
                  • <strong>Ryuk's Deal</strong> doubles point yield for one risk.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
