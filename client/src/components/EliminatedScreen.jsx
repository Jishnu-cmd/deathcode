import React, { useEffect, useState } from 'react';
import { Skull, HeartCrack, AlertOctagon, Activity, FileText, ExternalLink, ShieldAlert } from 'lucide-react';
import { sounds } from '../services/audio';

const GOOGLE_FORM_URL = 'https://forms.gle/VoVYSmxdP4if3zzp6';

export default function EliminatedScreen({ participant, onViewLeaderboard }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    sounds.playHeartAttack();

    // Lock permanent elimination in browser storage so refreshing cannot bypass
    try {
      localStorage.setItem('death_code_eliminated', 'true');
      if (participant?.team_name) {
        localStorage.setItem('death_code_eliminated_team', participant.team_name);
      }
      if (participant?.reg_id) {
        localStorage.setItem('death_code_eliminated_id', participant.reg_id);
      }
      if (participant?.score !== undefined) {
        localStorage.setItem('death_code_eliminated_score', String(participant.score));
      }
    } catch (_) {}

    // Attempt to open the Google Form in a new tab immediately
    try {
      window.open(GOOGLE_FORM_URL, '_blank');
    } catch (e) {
      console.warn('Auto window.open blocked by browser:', e);
    }

    // Auto-redirect timer to Google Form in case popup was blocked or user is waiting
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = GOOGLE_FORM_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [participant]);

  const handleOpenForm = () => {
    sounds.playKey();
    window.location.href = GOOGLE_FORM_URL;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Background vignette & ambient red glow */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-red-950/25 mix-blend-color-burn pointer-events-none animate-pulse" />

      <div className="relative max-w-2xl w-full bg-death-surface border-2 border-kira-red/80 rounded-2xl shadow-crimson-heavy p-6 sm:p-10 text-center space-y-6 overflow-hidden">
        
        {/* Sinister Top Crest */}
        <div className="relative w-24 h-24 mx-auto rounded-full bg-red-950/90 border-2 border-kira-red flex items-center justify-center shadow-crimson animate-bounce">
          <Skull className="w-12 h-12 text-white animate-pulse" />
          <HeartCrack className="w-6 h-6 text-kira-red absolute -bottom-1 -right-1" />
        </div>

        {/* Flatline ECG Waveform */}
        <div className="w-full h-8 bg-black/80 rounded-lg border border-red-900/60 flex items-center px-4 overflow-hidden relative">
          <div className="w-full flex items-center">
            <span className="font-mono text-[10px] text-red-500 mr-2 flex items-center gap-1 shrink-0">
              <Activity className="w-3 h-3 animate-ping" />
              ECG 000 BPM
            </span>
            <div className="flex-1 h-[2px] bg-red-600 shadow-[0_0_8px_#ff0033]" />
          </div>
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-mono text-kira-red uppercase tracking-[0.3em] font-bold block mb-1">
            TERMINAL CARDIAC FAILURE — CASE TERMINATED
          </span>
          <h1 className="gothic-title text-3xl sm:text-5xl font-extrabold text-white tracking-widest glow-crimson">
            NAME INSCRIBED
          </h1>
          <p className="font-mono text-sm text-red-400 mt-2 italic">
            "The human whose name is written in this notebook shall die of a heart attack."
          </p>
        </div>

        {/* Investigator Dossier Box */}
        <div className="p-5 rounded-xl bg-black/70 border border-death-border font-mono text-xs text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-death-border/60">
            <span className="text-gray-400">DECEASED INVESTIGATOR:</span>
            <span className="text-white font-bold tracking-wider">{participant?.team_name || 'Investigator'}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-death-border/60">
            <span className="text-gray-400">IDENTIFICATION ID:</span>
            <span className="text-kira-red font-bold">{participant?.reg_id || 'DC-TERMINATED'}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-death-border/60">
            <span className="text-gray-400">LIVES DEPLETED:</span>
            <span className="text-red-400 font-bold">10 / 10 EXHAUSTED (0 REMAINING)</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-death-border/60">
            <span className="text-gray-400">FINAL ACCUMULATED SCORE:</span>
            <span className="text-l-cyan font-bold text-sm">{participant?.score ?? 0} PTS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">INVESTIGATION SECTOR REACHED:</span>
            <span className="text-gray-200">
              {participant?.current_round === 1 && 'ROUND 1 — THE NOTEBOOK'}
              {participant?.current_round === 2 && "ROUND 2 — KIRA'S CODE"}
              {participant?.current_round === 3 && 'ROUND 3 — SPK SURVEILLANCE'}
              {(participant?.current_round >= 4 || !participant?.current_round) && "ROUND 4 — L'S INVESTIGATION"}
            </span>
          </div>
        </div>

        {/* Termination Notice (NO RESTART PERMITTED) */}
        <div className="p-3.5 rounded-lg bg-red-950/60 border border-kira-red/60 text-[11px] font-mono text-gray-200 space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-kira-red font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>RE-ENTRY PROHIBITED // NO RESTART PERMITTED</span>
          </div>
          <p className="text-gray-300 text-center">
            Your investigation has permanently ceased. Kira and the Task Force have locked this terminal. Please complete the mandatory post-mortem investigation debrief form below.
          </p>
        </div>

        {/* Mandatory Google Form Action (Replaces Restart Button) */}
        <div className="pt-2 space-y-3">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenForm}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-950 via-kira-red to-red-900 hover:from-red-900 hover:via-red-600 hover:to-red-800 text-white font-mono font-bold text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-crimson hover:shadow-crimson-heavy flex items-center justify-center gap-3 transition-all cursor-pointer border border-kira-red animate-pulse"
          >
            <FileText className="w-5 h-5 text-white shrink-0" />
            <span>OPEN INVESTIGATION DEBRIEF (GOOGLE FORM)</span>
            <ExternalLink className="w-4 h-4 text-white shrink-0" />
          </a>

          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-kira-red animate-ping" />
            <span>
              {countdown > 0
                ? `Redirecting to Google Form in ${countdown}s...`
                : 'Redirecting to Google Form now...'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
