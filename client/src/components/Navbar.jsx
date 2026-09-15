import React, { useState, useEffect } from 'react';
import { Skull, Volume2, VolumeX, Award, Maximize, Minimize } from 'lucide-react';
import { sounds } from '../services/audio';
import { toggleFullScreen, isFullScreen, addFullscreenChangeListener } from '../services/fullscreen';

export default function Navbar({
  eventState,
  participant,
  activeTab,
  setActiveTab
}) {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [inFullScreen, setInFullScreen] = useState(isFullScreen());

  useEffect(() => {
    const cleanup = addFullscreenChangeListener(() => {
      setInFullScreen(isFullScreen());
    });
    return cleanup;
  }, []);

  const handleFullscreenToggle = () => {
    sounds.playKey();
    toggleFullScreen();
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playKey();
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '45:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = eventState && eventState.time_remaining_seconds <= 300;

  return (
    <header className="border-b border-death-border bg-death-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab('quiz')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-kira-red to-black border border-kira-red/50 flex items-center justify-center shadow-crimson">
            <Skull className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="gothic-title font-bold text-lg text-white tracking-widest block leading-none">
              DEATH CODE
            </span>
            <span className="text-[10px] text-kira-red font-mono uppercase tracking-wider block">
              THE KIRA PROTOCOL
            </span>
          </div>
        </div>

        {/* Center: Active Round & Synchronized Server Timer */}
        <div className="flex items-center gap-4">
          {eventState && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-death-card border border-death-border text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-kira-red animate-ping" />
              <span className="text-gray-300">
                {!participant && '📖 PRE-ENTRY: ENTER NOTEBOOK TO COMMENCE'}
                {participant && eventState.status === 'LOBBY' && '⏳ LOBBY WAITING'}
                {participant && eventState.status === 'ROUND_1' && '📓 ROUND 1: THE NOTEBOOK'}
                {participant && eventState.status === 'ROUND_2' && "🧩 ROUND 2: KIRA'S CODE"}
                {participant && eventState.status === 'ROUND_3' && '📡 ROUND 3: SPK SURVEILLANCE'}
                {participant && eventState.status === 'ROUND_4' && "🕵️ ROUND 4: L'S INVESTIGATION"}
                {participant && eventState.status === 'ENDED' && '☠️ CASE CONCLUDED'}
              </span>
            </div>
          )}

          {/* Countdown Clock */}
          <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-lg tracking-wider flex items-center gap-2 ${
            isLowTime 
              ? 'bg-red-950/60 border-kira-red text-kira-red animate-pulse shadow-crimson' 
              : 'bg-death-card border-death-border text-white'
          }`}>
            <span className="text-xs text-gray-400 font-sans uppercase">TIME</span>
            <span>{!participant ? '45:00' : formatTime(eventState?.time_remaining_seconds)}</span>
          </div>
        </div>

        {/* Right Controls: Lives, Score, Audio */}
        <div className="flex items-center gap-3">
          {participant && (
            <>
              {/* 10 Lives Counter */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono text-xs transition-all ${
                  participant.lives <= 3
                    ? 'bg-red-950/80 border-kira-red text-kira-red animate-pulse shadow-crimson'
                    : 'bg-black/70 border-death-border text-gray-200'
                }`}
                title={`${participant.lives} / 10 Lives Remaining`}
              >
                <div className="hidden sm:flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((heart) => (
                    <Skull
                      key={heart}
                      className={`w-3.5 h-3.5 transition-colors ${
                        heart <= participant.lives ? 'text-kira-red fill-kira-red' : 'text-gray-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5 text-kira-red fill-kira-red sm:hidden" />
                  <span className="font-bold text-xs">
                    {participant.lives}
                    <span className="text-[10px] text-gray-400 font-normal">/10 LIVES</span>
                  </span>
                </div>
              </div>

              {/* Score Badge */}
              <div className="bg-death-card border border-kira-red/40 px-3 py-1 rounded-md text-sm font-mono font-bold text-white flex items-center gap-1.5 shadow-crimson">
                <Award className="w-4 h-4 text-kira-red" />
                <span>{participant.score} <span className="text-xs text-gray-400 font-normal">PTS</span></span>
              </div>
            </>
          )}

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={handleFullscreenToggle}
            className={`p-2 rounded-md border transition-all cursor-pointer flex items-center justify-center ${
              inFullScreen
                ? 'bg-death-card border-death-border text-gray-300 hover:text-white hover:border-kira-red'
                : 'bg-red-950/70 border-kira-red text-kira-red shadow-crimson animate-pulse hover:bg-red-900/80'
            }`}
            title={inFullScreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode (Enforced)"}
          >
            {inFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-md bg-death-card border border-death-border text-gray-300 hover:text-white hover:border-kira-red transition-all cursor-pointer"
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-kira-red" />}
          </button>
        </div>

      </div>
    </header>
  );
}
