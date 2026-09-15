import React, { useState, useEffect } from 'react';
import { Skull, Trophy, CheckCircle2, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { sounds } from '../services/audio';

const WINNER_FORM_URL = 'https://forms.gle/u1fEfRawSJYWGRDE7';

export default function CinematicReveal({ result, participant, onViewLeaderboard }) {
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sounds.playHeartbeat();

    // Progress bar tick
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase(2);
          sounds.playStinger();
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 2) {
      const timer = setTimeout(() => {
        setPhase(3);
        sounds.playBell();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 3 && result?.is_correct) {
      try {
        localStorage.setItem('death_code_winner', 'true');
        if (participant?.team_name) {
          localStorage.setItem('death_code_winner_team', participant.team_name);
        }
      } catch (_) {}
    }
  }, [phase, result?.is_correct, participant]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-red-950/40 via-black to-black opacity-80 pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 space-y-6 font-mono py-4">
        
        {phase === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-xs uppercase tracking-widest text-kira-red font-bold">
              VERIFYING FORENSIC DATA
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-wider">
              ANALYZING EVIDENCE...
            </h2>

            <div className="w-full bg-death-card border border-death-border h-4 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-kira-red h-full rounded-full transition-all duration-75 shadow-crimson"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right text-xs text-gray-400">{progress}%</div>
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-4 animate-pulse">
            <div className="text-xs uppercase tracking-widest text-l-cyan font-bold">
              BINARY SEQUENCE CORRELATED
            </div>

            <div className="text-4xl sm:text-5xl font-bold text-l-cyan tracking-widest glow-cyan">
              {result?.binary_code || '101101'}
            </div>

            <p className="text-xs text-gray-300">
              CROSS-REFERENCING ENCRYPTED NATIONAL POLICE REGISTRY...
            </p>
          </div>
        )}

        {phase === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Criminal Stamped Banner */}
            <div className={`p-8 rounded-2xl bg-death-card border-2 shadow-crimson space-y-4 relative overflow-hidden ${
              result?.is_correct ? 'border-yellow-500 shadow-yellow-500/30' : 'border-kira-red shadow-crimson'
            }`}>
              <div className={`w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center shadow-lg ${
                result?.is_correct 
                  ? 'bg-yellow-950/80 border-yellow-400 text-yellow-400 shadow-yellow-500/40' 
                  : 'bg-red-950 border-kira-red text-kira-red shadow-crimson'
              }`}>
                {result?.is_correct ? (
                  <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                ) : (
                  <Skull className="w-10 h-10 animate-pulse" />
                )}
              </div>

              <div className="gothic-title text-3xl sm:text-4xl font-bold text-white tracking-widest glow-crimson">
                {result?.is_correct ? '🏆 YOU WIN! KIRA APPREHENDED 🏆' : '☠️ KIRA ACCUSATION FAILED ☠️'}
              </div>

              <div className="p-4 rounded-xl bg-black/70 border border-death-border space-y-2 text-xs text-left">
                <div className="flex justify-between border-b border-death-border pb-1.5">
                  <span className="text-gray-400">SECRET CODE STATUS:</span>
                  <span className="text-green-400 font-bold">{result?.cleared_bits_count || '3+'}/6 SECRET CODES CLEARED [ {result?.binary_code} ]</span>
                </div>
                <div className="flex justify-between border-b border-death-border pb-1.5">
                  <span className="text-gray-400">ACCUSED SUSPECT:</span>
                  <span className="text-white font-bold">{result?.kira_code} ({result?.kira_name})</span>
                </div>
                <div className="flex justify-between border-b border-death-border pb-1.5">
                  <span className="text-gray-400">VERDICT STATUS:</span>
                  <span className={`font-bold ${result?.is_correct ? 'text-green-400' : 'text-kira-red'}`}>
                    {result?.is_correct ? 'PROVEN BEYOND DOUBT — YOU WIN! (+10 PTS)' : 'WRONG SUSPECT ACCUSED (-1 LIFE)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FINAL TOTAL SCORE:</span>
                  <span className="text-l-cyan font-bold text-base">{result?.final_score} PTS</span>
                </div>
              </div>

              <blockquote className="italic text-gray-300 text-xs pt-2 border-t border-death-border/50">
                "{result?.is_correct ? 'Justice has prevailed! You unlocked the required secret codes and defeated Kira!' : 'The real Kira continues to operate from the shadows.'}"
              </blockquote>
            </div>

            {/* WINNER GOOGLE FORM BUTTON (AFTER WINNING GAME) */}
            {result?.is_correct && (
              <div className="space-y-2 w-full pt-1">
                <a
                  href={WINNER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sounds.playBell()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-mono font-extrabold text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-3 transition-all cursor-pointer border-2 border-yellow-200 animate-pulse hover:scale-[1.02]"
                >
                  <Trophy className="w-5 h-5 text-black shrink-0" />
                  <span>COMPLETE WINNER VERIFICATION (GOOGLE FORM)</span>
                  <ExternalLink className="w-5 h-5 text-black shrink-0" />
                </a>
                <p className="text-[11px] text-amber-300 font-mono tracking-wider">
                  ★ All victorious investigators must submit this verification form to finalize records.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                sounds.playKey();
                onViewLeaderboard();
              }}
              className="px-8 py-3.5 bg-kira-red hover:bg-red-700 text-white font-mono font-bold text-sm tracking-widest rounded-xl shadow-crimson transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>VIEW OFFICIAL LEADERBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
