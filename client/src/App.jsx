import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import RegistrationModal from './components/RegistrationModal';
import AntiCheatGuard from './components/AntiCheatGuard';
import Round1Notebook from './components/Round1Notebook';
import Round2KirasCode from './components/Round2KirasCode';
import Round3Wiretap from './components/Round3Wiretap';
import Round3Investigation from './components/Round3Investigation';
import EliminatedScreen from './components/EliminatedScreen';
import CinematicReveal from './components/CinematicReveal';
import Leaderboard from './components/Leaderboard';
import { getMyProfile, getCurrentQuiz, advanceRound, resetEvent } from './services/api';
import { sounds } from './services/audio';
import { Skull, Clock, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';
import deathThemeBg from './assets/death_note_theme_bg.jpg';

export default function App() {
  const [participant, setParticipant] = useState(null);
  const [eventState, setEventState] = useState(null);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'leaderboard'
  const [quizData, setQuizData] = useState(null);
  const [cinematicResult, setCinematicResult] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const wsRef = useRef(null);

  // Always start from first (Registration Screen) every time the link is opened or refreshed UNLESS eliminated
  useEffect(() => {
    try {
      const isEliminated = localStorage.getItem('death_code_eliminated') === 'true';
      if (isEliminated) {
        setParticipant({
          team_name: localStorage.getItem('death_code_eliminated_team') || 'Investigator',
          reg_id: localStorage.getItem('death_code_eliminated_id') || 'DC-TERMINATED',
          score: parseInt(localStorage.getItem('death_code_eliminated_score') || '0', 10),
          lives: 0,
          is_eliminated: 1,
          current_round: 1
        });
        setActiveTab('quiz');
        return;
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    setParticipant(null);
    setQuizData(null);
    setActiveTab('quiz');

    // Ensure timer is paused at 45:00 until participant clicks Enter The Notebook
    fetch('/api/event/prepare-entry', { method: 'POST' }).catch(() => {});

    const handleClearStorage = () => {
      try {
        if (localStorage.getItem('death_code_eliminated') !== 'true') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (_) {}
    };
    window.addEventListener('beforeunload', handleClearStorage);
    window.addEventListener('pagehide', handleClearStorage);
    return () => {
      window.removeEventListener('beforeunload', handleClearStorage);
      window.removeEventListener('pagehide', handleClearStorage);
    };
  }, []);

  // Connect WebSocket for live countdown and announcements
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Fallback to direct port 5000 if vite proxy not connected
    const directWsUrl = 'ws://localhost:5000';
    
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      ws = new WebSocket(directWsUrl);
    }
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INIT') {
          setEventState(msg.event);
        } else if (msg.type === 'TICK') {
          setEventState((prev) => ({
            ...prev,
            time_remaining_seconds: msg.time_remaining_seconds,
            status: msg.status
          }));
        } else if (msg.type === 'EVENT_UPDATE') {
          setEventState(msg.event);
        } else if (msg.type === 'ANNOUNCEMENT') {
          sounds.playBell();
          setAnnouncement(msg);
          setTimeout(() => setAnnouncement(null), 8000);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Fetch quiz content whenever active round or participant changes
  const loadActiveQuiz = async () => {
    if (!participant || !participant.reg_id) return;
    try {
      const res = await getCurrentQuiz(participant.reg_id);
      setQuizData(res);
      if (res.participant) {
        setParticipant((prev) => ({ ...prev, ...res.participant }));
      }
    } catch (err) {
      console.error('Failed to load active quiz:', err);
    }
  };

  useEffect(() => {
    if (participant) {
      loadActiveQuiz();
    }
  }, [participant?.reg_id, eventState?.status]);

  const handleRegistered = (newParticipant, newEvent) => {
    setParticipant(newParticipant);
    setEventState(newEvent);
    sounds.playBell();
  };

  const handleLogout = () => {
    localStorage.removeItem('death_code_reg_id');
    setParticipant(null);
    setQuizData(null);
    setCinematicResult(null);
    setActiveTab('quiz');
  };

  const handleQuestionAnswered = (pqId, option, result) => {
    setQuizData((prev) => {
      if (!prev || !prev.questions) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.participant_question_id === pqId) {
            return {
              ...q,
              is_answered: 1,
              selected_option: option,
              is_correct: result.is_correct ? 1 : 0,
              points_awarded: result.points_awarded
            };
          }
          return q;
        })
      };
    });

    setParticipant((prev) => ({
      ...prev,
      score: result.new_score,
      lives: result.new_lives !== undefined ? result.new_lives : prev.lives,
      is_eliminated: result.is_eliminated !== undefined ? result.is_eliminated : (result.new_lives <= 0 ? 1 : prev.is_eliminated)
    }));
  };

  const handleAdvanceRound = async () => {
    if (!participant || !participant.reg_id) return;
    try {
      const res = await advanceRound(participant.reg_id);
      if (res.participant) {
        setParticipant((prev) => ({ ...prev, ...res.participant, current_round: res.current_round }));
      }
      sounds.playBell();
      loadActiveQuiz();
    } catch (err) {
      console.error('Failed to advance round:', err);
    }
  };

  const handleResetTournament = async () => {
    try {
      localStorage.removeItem('death_code_eliminated');
      localStorage.removeItem('death_code_eliminated_team');
      localStorage.removeItem('death_code_eliminated_id');
      localStorage.removeItem('death_code_eliminated_score');
      localStorage.removeItem('death_code_winner');
      localStorage.removeItem('death_code_winner_team');
      const res = await resetEvent();
      if (res.event) {
        setEventState(res.event);
      }
      sounds.playBell();
      loadActiveQuiz();
    } catch (err) {
      console.error('Failed to reset tournament:', err);
    }
  };

  return (
    <div className="min-h-screen relative text-parchment flex flex-col font-sans selection:bg-kira-red selection:text-white overflow-x-hidden bg-[#050508]">
      
      {/* Dynamic Thematic Death Note Background Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img 
          src={deathThemeBg} 
          alt="Death Note Thematic Wallpaper"
          className="w-full h-full object-cover object-center filter contrast-125 brightness-95 opacity-55 scale-100"
        />
        {/* Cinematic Vignette, Crimson Glow & Atmospheric Overlays */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/75 via-[#07070a]/40 to-[#07070a]/85" />
        <div className="absolute inset-0 bg-gradient-to-tr from-red-950/20 via-transparent to-red-950/20" />
        <div className="absolute inset-0 crt-scanlines opacity-15" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top Navigation */}
        <Navbar
          eventState={eventState}
          participant={participant}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      {/* Anti-Cheat Background Watcher */}
      {participant && (
        <AntiCheatGuard participant={participant} />
      )}

      {/* Real-time System Announcement Banner */}
      {announcement && (
        <div className="bg-gradient-to-r from-red-950 via-black to-red-950 border-y border-kira-red py-3 px-4 shadow-crimson text-center font-mono text-xs text-white flex items-center justify-center gap-3 animate-pulse sticky top-16 z-40">
          <AlertTriangle className="w-5 h-5 text-kira-red shrink-0" />
          <div>
            <strong className="text-kira-red uppercase mr-2 font-bold">[{announcement.title}]</strong>
            <span>{announcement.message}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        
        {/* LEADERBOARD VIEW */}
        {activeTab === 'leaderboard' && (
          <Leaderboard isAdmin={false} />
        )}

        {/* PARTICIPANT QUIZ VIEW */}
        {activeTab === 'quiz' && (
          <>
            {/* If Not Registered / Logged In */}
            {!participant ? (
              <RegistrationModal onRegistered={handleRegistered} />
            ) : (participant?.lives <= 0 || participant?.is_eliminated === 1) ? (
              /* FATAL ELIMINATION SCREEN — HEART ATTACK */
              <EliminatedScreen
                participant={participant}
                onViewLeaderboard={() => setActiveTab('leaderboard')}
              />
            ) : (
              <>
                {/* EVENT ENDED CHECK */}
                {eventState?.status === 'ENDED' ? (
                  !cinematicResult && (
                    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-red-950 border-2 border-kira-red flex items-center justify-center text-kira-red shadow-crimson">
                        <Skull className="w-10 h-10 animate-pulse" />
                      </div>

                      <h1 className="gothic-title text-3xl sm:text-4xl font-bold text-white tracking-widest glow-crimson">
                        CASE CONCLUDED
                      </h1>

                      <p className="font-mono text-sm text-gray-300 leading-relaxed">
                        The 45-minute countdown has elapsed. All submissions have been locked into the Task Force national records.
                      </p>

                      <div className="p-6 rounded-2xl bg-death-card border border-death-border max-w-sm mx-auto font-mono text-sm space-y-2">
                        <div className="text-gray-400">FINAL TEAM SCORE</div>
                        <div className="text-4xl font-bold text-l-cyan">{participant.score} PTS</div>
                      </div>

                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => {
                            localStorage.removeItem('death_code_reg_id');
                            window.location.reload();
                          }}
                          className="px-8 py-3 bg-kira-red hover:bg-red-700 text-white font-mono font-bold text-xs tracking-widest uppercase rounded-lg shadow-crimson transition-all cursor-pointer"
                        >
                          START NEW INVESTIGATION
                        </button>
                      </div>
                    </div>
                  )
                ) : participant?.current_round >= 4 ? (
                  /* ROUND 4: L'S FINAL INVESTIGATION */
                  <Round3Investigation
                    participant={participant}
                    roundData={quizData}
                    onUpdateParticipant={(updates) => setParticipant((prev) => ({ ...prev, ...updates }))}
                    onCinematicComplete={(res) => setCinematicResult(res)}
                  />
                ) : participant?.current_round === 3 ? (
                  /* ROUND 3: SPK SURVEILLANCE & WIRETAP */
                  <Round3Wiretap
                    participant={participant}
                    questions={quizData?.questions || []}
                    onAnswered={handleQuestionAnswered}
                    onUpdateParticipant={(updates) => setParticipant((prev) => ({ ...prev, ...updates }))}
                    onAdvanceRound={handleAdvanceRound}
                  />
                ) : participant?.current_round === 2 ? (
                  /* ROUND 2: KIRA'S CODE */
                  <Round2KirasCode
                    participant={participant}
                    questions={quizData?.questions || []}
                    onAnswered={handleQuestionAnswered}
                    onUpdateParticipant={(updates) => setParticipant((prev) => ({ ...prev, ...updates }))}
                    onAdvanceRound={handleAdvanceRound}
                  />
                ) : (
                  /* DEFAULT: ROUND 1 — THE NOTEBOOK (STARTS IMMEDIATELY ON ENTRY) */
                  <Round1Notebook
                    participant={participant}
                    questions={quizData?.questions || []}
                    onAnswered={handleQuestionAnswered}
                    onAdvanceRound={handleAdvanceRound}
                  />
                )}
              </>
            )}
          </>
        )}

      </main>

      {/* Cinematic End Sequence Modal */}
      {cinematicResult && (
        <CinematicReveal
          result={cinematicResult}
          participant={participant}
          onViewLeaderboard={() => {
            setCinematicResult(null);
            setActiveTab('leaderboard');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-death-border/50 py-4 text-center font-mono text-[11px] text-gray-400 bg-black/40 backdrop-blur-sm">
        DEATH CODE // THE KIRA PROTOCOL — SPECIAL INVESTIGATION UNIT
      </footer>
      </div>
    </div>
  );
}
