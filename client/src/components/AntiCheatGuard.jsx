import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Eye, Maximize } from 'lucide-react';
import { logTabSwitch } from '../services/api';
import { sounds } from '../services/audio';
import { requestFullScreen, isFullScreen, addFullscreenChangeListener } from '../services/fullscreen';

export default function AntiCheatGuard({ participant }) {
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningReason, setWarningReason] = useState('focus'); // 'focus' | 'fullscreen'
  const [switchCount, setSwitchCount] = useState(0);
  const [inFullScreen, setInFullScreen] = useState(isFullScreen());

  useEffect(() => {
    if (!participant) return;

    // Monitor fullscreen state
    const handleFullscreenChange = () => {
      const full = isFullScreen();
      setInFullScreen(full);
      if (!full) {
        sounds.playError();
        logTabSwitch(participant.reg_id).catch(() => {});
        setSwitchCount((prev) => prev + 1);
        setWarningReason('fullscreen');
        setWarningOpen(true);
      }
    };

    const cleanupFullscreenListener = addFullscreenChangeListener(handleFullscreenChange);

    // Handle tab switching / window blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sounds.playError();
        logTabSwitch(participant.reg_id).catch(() => {});
        setSwitchCount((prev) => prev + 1);
        setWarningReason('focus');
        setWarningOpen(true);
      }
    };

    // Prevent context menu (right click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      sounds.playError();
      return false;
    };

    // Prevent copy/paste
    const handleCopyCutPaste = (e) => {
      // Allow in inputs if typing normally, but prevent raw copy
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        sounds.playError();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);

    return () => {
      cleanupFullscreenListener();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
    };
  }, [participant]);

  const handleReturnToInvestigation = () => {
    sounds.playKey();
    requestFullScreen();
    setWarningOpen(false);
  };

  return (
    <>
      {/* Floating Prompt if participant is not in fullscreen mode */}
      {!inFullScreen && !warningOpen && (
        <div className="fixed bottom-4 right-4 z-40 animate-pulse">
          <button
            onClick={() => {
              sounds.playKey();
              requestFullScreen();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-950/90 border border-kira-red text-white text-xs font-mono font-bold rounded-lg shadow-crimson hover:bg-kira-red transition-all cursor-pointer"
            title="Kira Surveillance mandates fullscreen mode"
          >
            <Maximize className="w-4 h-4 text-kira-red animate-spin" style={{ animationDuration: '4s' }} />
            <span>ENABLE FULLSCREEN MODE</span>
          </button>
        </div>
      )}

      {/* Surveillance Violation Warning Modal */}
      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-death-card border-2 border-kira-red p-6 rounded-xl shadow-crimson text-center animate-bounce">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border border-kira-red flex items-center justify-center mb-4 text-kira-red shadow-crimson">
              <Eye className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="gothic-title text-xl font-bold text-white mb-2 tracking-widest glow-crimson">
              SURVEILLANCE WARNING
            </h3>
            
            <p className="text-sm text-gray-300 mb-4 font-mono leading-relaxed">
              {warningReason === 'fullscreen'
                ? 'Fullscreen mode was exited! The investigation environment mandates an active full screen session.'
                : 'Tab switch or loss of window focus detected! The Task Force and Kira are logging all infractions.'}
            </p>

            <div className="bg-black/60 border border-red-900/50 p-3 rounded-lg text-xs font-mono text-kira-red mb-5">
              INFRACTIONS RECORDED: <span className="text-white font-bold">{switchCount}</span>
              <br />
              <span className="text-gray-400 text-[10px]">Repeat offenses will be flagged for review during final scoring.</span>
            </div>

            <button
              onClick={handleReturnToInvestigation}
              className="w-full py-3 px-4 bg-kira-red hover:bg-red-700 text-white font-mono font-bold rounded-lg transition-all shadow-crimson tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize className="w-4 h-4" />
              <span>RETURN & RESTORE FULLSCREEN</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
