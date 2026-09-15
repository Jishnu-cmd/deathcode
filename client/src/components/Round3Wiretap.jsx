import React, { useState, useEffect } from 'react';
import { Radio, CheckCircle, ArrowRight, ArrowLeft, RotateCcw, Lock, AlertOctagon, Terminal, Sparkles, Cpu, Layers } from 'lucide-react';
import { submitMcqAnswer } from '../services/api';
import { sounds } from '../services/audio';

export default function Round3Wiretap({
  participant,
  questions,
  onAnswered,
  onAdvanceRound
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const activeQ = questions[currentIndex];

  // Initialize or reset slots whenever current question changes
  useEffect(() => {
    if (activeQ) {
      if (activeQ.is_answered && activeQ.selected_option) {
        const saved = activeQ.selected_option.split(/\s*\|\|\|\s*/);
        setSlots([saved[0] || null, saved[1] || null, saved[2] || null, saved[3] || null]);
      } else {
        setSlots([null, null, null, null]);
      }
      setFeedback(null);
    }
  }, [currentIndex, activeQ?.participant_question_id]);

  if (!activeQ) {
    return (
      <div className="p-12 text-center font-mono text-gray-400">
        Initializing SPK Wiretap feed...
      </div>
    );
  }

  // Pool of keywords provided for this question (scrambled)
  const questionKeywords = activeQ.keywords || [
    activeQ.option_a,
    activeQ.option_b,
    activeQ.option_c,
    activeQ.option_d
  ].filter(Boolean);

  // Compute available (unslotted) keywords
  // We handle duplicates correctly by counting instances
  const getAvailableKeywords = () => {
    const counts = {};
    questionKeywords.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
    slots.forEach(k => { if (k && counts[k]) counts[k]--; });
    
    const available = [];
    questionKeywords.forEach(k => {
      if (counts[k] > 0) {
        available.push(k);
        counts[k]--;
      }
    });
    return available;
  };

  const availableKeywords = getAvailableKeywords();
  const allSlotsFilled = slots.every(s => s !== null);

  // Place a keyword in the first open slot
  const handleSelectKeyword = (keyword) => {
    if (activeQ.is_answered || submitting) return;
    const firstEmptyIndex = slots.findIndex(s => s === null);
    if (firstEmptyIndex === -1) return; // all slots filled

    sounds.playKey();
    const newSlots = [...slots];
    newSlots[firstEmptyIndex] = keyword;
    setSlots(newSlots);
  };

  // Remove a keyword from a specific slot
  const handleRemoveSlot = (slotIndex) => {
    if (activeQ.is_answered || submitting) return;
    if (slots[slotIndex] === null) return;

    sounds.playKey();
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
  };

  // Clear all slots
  const handleResetSlots = () => {
    if (activeQ.is_answered || submitting) return;
    sounds.playKey();
    setSlots([null, null, null, null]);
  };

  // Submit sequence to server
  const handleSubmitAnswer = async () => {
    if (!allSlotsFilled || activeQ.is_answered || submitting) return;

    setSubmitting(true);
    try {
      const selectedOptionString = slots.join(' ||| ');
      const res = await submitMcqAnswer(
        participant.reg_id,
        activeQ.participant_question_id,
        selectedOptionString,
        slots // pass array of keywords
      );

      if (res.is_correct) {
        sounds.playSuccess();
      } else {
        sounds.playError();
      }

      setFeedback(res);
      onAnswered(activeQ.participant_question_id, selectedOptionString, res);
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => q.is_answered).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Split SQL code snippet by [ 1 ], [ 2 ], [ 3 ], [ 4 ] placeholders for live interactive rendering
  const renderInteractiveSqlCode = () => {
    if (!activeQ.code_snippet) return null;

    const parts = [];
    const regex = /\[\s*([1-4])\s*\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(activeQ.code_snippet)) !== null) {
      // Push code before placeholder
      if (match.index > lastIndex) {
        parts.push({
          type: 'code',
          text: activeQ.code_snippet.substring(lastIndex, match.index)
        });
      }

      const slotNum = parseInt(match[1], 10);
      const slotVal = slots[slotNum - 1];

      parts.push({
        type: 'slot',
        slotNum,
        value: slotVal
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < activeQ.code_snippet.length) {
      parts.push({
        type: 'code',
        text: activeQ.code_snippet.substring(lastIndex)
      });
    }

    return (
      <pre className="font-mono text-xs sm:text-sm leading-relaxed p-4 bg-black/90 border border-cyan-900/60 rounded-xl overflow-x-auto shadow-inner text-gray-300">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return <span key={idx}>{p.text}</span>;
          }

          const isFilled = p.value !== null;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => isFilled && handleRemoveSlot(p.slotNum - 1)}
              disabled={activeQ.is_answered || !isFilled}
              className={`inline-flex items-center gap-1 mx-1 px-2.5 py-1 rounded font-bold transition-all ${
                isFilled
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer hover:bg-red-950/80 hover:border-red-500 hover:text-red-300'
                  : 'bg-yellow-950/40 border border-dashed border-yellow-500/80 text-yellow-300 animate-pulse cursor-default'
              }`}
              title={isFilled ? `Click to remove [ ${p.value} ] from Slot ${p.slotNum}` : `Slot [ ${p.slotNum} ] is empty`}
            >
              <span className="text-[10px] text-gray-400 font-normal">[{p.slotNum}]</span>
              <span>{isFilled ? p.value : `? SLOT ${p.slotNum}`}</span>
            </button>
          );
        })}
      </pre>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-900/40">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-4 h-4 animate-pulse" />
            ROUND 3 // SPK SURVEILLANCE & SYNTAX WIRE工事
          </span>
          <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-cyan">
            QUERY REASSEMBLY WIRE
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Arrange missing SQL keywords in exact sequential order ([ 1 ] $\rightarrow$ [ 4 ]) to repair the intercepted surveillance query.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">QUESTIONS SOLVED</div>
            <div className="text-sm font-bold text-cyan-300">{answeredCount} / {questions.length}</div>
          </div>

          <div className="w-10 h-10 rounded-lg bg-death-card border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-cyan-400 shadow-l-glow">
            {currentIndex + 1}
          </div>
        </div>
      </div>

      {/* Progress Dots Nav */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playKey();
                setCurrentIndex(idx);
              }}
              className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                idx === currentIndex
                  ? 'bg-cyan-500 text-black shadow-l-glow scale-105'
                  : q.is_answered
                  ? q.is_correct
                    ? 'bg-green-950/80 border border-green-700 text-green-400'
                    : 'bg-red-950/80 border border-red-700 text-red-400'
                  : 'bg-death-card border border-death-border text-gray-400 hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-gray-400 shrink-0">
          VALUE: <strong className="text-cyan-400">+4 PTS</strong> / -1 LIFE
        </div>
      </div>

      {/* Main Wiretap Question Card */}
      <div className="bg-death-card border border-death-border p-6 rounded-2xl shadow-2xl relative space-y-6">
        
        {/* Category & Concept Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {activeQ.category}
            </span>
            <span className="text-xs font-mono text-gray-400">
              {activeQ.concept}
            </span>
          </div>

          <span className="text-[11px] font-mono text-gray-500 uppercase">
            CHALLENGE #{currentIndex + 1} OF {questions.length}
          </span>
        </div>

        {/* Question Scenario */}
        <div className="font-mono text-sm text-gray-200 leading-relaxed">
          {activeQ.question_text}
        </div>

        {/* Live Interactive SQL Code Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              INTERCEPTED SQL PIPELINE (LIVE RECONSTRUCTION):
            </span>
            <span className="text-[10px] text-gray-500">
              Click slotted tokens inside or below to remove
            </span>
          </div>

          {renderInteractiveSqlCode()}
        </div>

        {/* Interactive Slots Arrangement HUD */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              ARRANGE IN ORDER (SLOT 1 $\rightarrow$ SLOT 4):
            </span>

            {!activeQ.is_answered && (
              <button
                type="button"
                onClick={handleResetSlots}
                disabled={slots.every(s => s === null)}
                className="text-[11px] font-mono text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>CLEAR SLOTS</span>
              </button>
            )}
          </div>

          {/* 4 Numbered Slots Tray */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((slotIdx) => {
              const val = slots[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center min-h-[72px] transition-all relative ${
                    val !== null
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-l-glow'
                      : 'bg-black/60 border-dashed border-gray-700 text-gray-500'
                  }`}
                >
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                    SLOT [ {slotIdx + 1} ]
                  </span>

                  {val !== null ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slotIdx)}
                      disabled={activeQ.is_answered}
                      className="font-mono font-bold text-xs sm:text-sm text-cyan-300 hover:text-red-400 transition-colors cursor-pointer text-center break-all"
                      title="Click to remove from slot"
                    >
                      {val}
                    </button>
                  ) : (
                    <span className="font-mono text-[11px] text-gray-600 italic">
                      Empty
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Keywords Pool (Click to Place) */}
        {!activeQ.is_answered && (
          <div className="space-y-2 pt-1 border-t border-death-border/50">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
              AVAILABLE KEYWORD CHIPS (CLICK TO PLACE IN NEXT SLOT):
            </span>

            <div className="flex flex-wrap items-center gap-2.5">
              {availableKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectKeyword(kw)}
                  className="px-4 py-2 rounded-lg bg-death-surface hover:bg-cyan-950 border border-cyan-900 hover:border-cyan-400 text-cyan-200 font-mono font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{kw}</span>
                </button>
              ))}

              {availableKeywords.length === 0 && (
                <span className="text-xs font-mono text-cyan-400 italic">
                  All 4 keywords placed into slots! Ready to verify sequence.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lock & Submit Button */}
        {!activeQ.is_answered && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!allSlotsFilled || submitting}
              className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                allSlotsFilled && !submitting
                  ? 'bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-900 text-white shadow-l-glow hover:opacity-95 cursor-pointer scale-[1.01]'
                  : 'bg-death-surface border border-death-border text-gray-600 cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'REASSEMBLING PIPELINE...' : 'LOCK & VERIFY SEQUENCE'}</span>
            </button>
          </div>
        )}

        {/* Post-Submission Feedback Banner */}
        {(activeQ.is_answered || feedback) && (
          <div className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${
            (feedback?.is_correct ?? activeQ.is_correct)
              ? 'bg-green-950/60 border-green-600/80 text-green-300'
              : 'bg-red-950/70 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {(feedback?.is_correct ?? activeQ.is_correct) ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>SYNTAX SEQUENCE VERIFIED (+4 PTS)</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  <span>SYNTAX MALFUNCTION — INCORRECT ORDER (-1 LIFE)</span>
                </>
              )}
            </div>

            {/* Expected Sequence Display */}
            {activeQ.correct_sequence && (
              <div className="bg-black/60 p-3 rounded-lg border border-death-border/80 space-y-1 text-[11px]">
                <div className="text-gray-400 font-bold uppercase tracking-wider">CORRECT SEQUENTIAL ORDER:</div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  {activeQ.correct_sequence.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700">
                      [{i + 1}] {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Explanation */}
            <p className="text-gray-300 leading-relaxed">
              {activeQ.explanation || feedback?.explanation}
            </p>
          </div>
        )}

        {/* Card Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-death-border/50">
          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              setCurrentIndex((i) => Math.max(0, i - 1));
            }}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg bg-death-surface border border-death-border text-xs font-mono text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PREVIOUS</span>
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={() => {
                sounds.playKey();
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
              }}
              className="px-5 py-2 rounded-lg bg-death-surface border border-death-border hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>NEXT QUERY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdvanceRound}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-900 to-cyan-600 text-white font-mono font-bold text-xs tracking-widest uppercase rounded shadow-l-glow flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-95 animate-pulse"
            >
              <span>PROCEED TO ROUND 4 // INVESTIGATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
