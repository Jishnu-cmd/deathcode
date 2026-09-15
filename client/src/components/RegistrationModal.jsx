import React, { useState } from 'react';
import { Skull, BookOpen, AlertTriangle, ChevronRight, Eye } from 'lucide-react';
import { registerParticipant } from '../services/api';
import { sounds } from '../services/audio';
import { requestFullScreen } from '../services/fullscreen';
import yagamiPoster from '../assets/yagami_light_poster.jpg';

export default function RegistrationModal({ onRegistered }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'rules'
  const [showPosterZoom, setShowPosterZoom] = useState(false);

  const handleEnterNotebook = async () => {
    // Initiate browser fullscreen immediately on participant user gesture
    requestFullScreen();
    setLoading(true);
    setError(null);
    try {
      sounds.playStinger();
      const res = await registerParticipant({
        reg_id: 'DC-' + Math.floor(1000 + Math.random() * 9000),
        team_name: 'Investigator'
      });
      if (res && res.participant) {
        onRegistered(res.participant, res.event);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please retry.');
      sounds.playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background Vignette & Ambient Crimson Lighting */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-kira-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-20" />

      {/* Top Classification Banner */}
      <div className="relative z-10 w-full max-w-6xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-death-border/80 pb-3 font-mono text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-kira-red animate-ping" />
          <span className="text-kira-red font-bold uppercase tracking-widest">[TOP SECRET]</span>
          <span className="tracking-wider">TASK FORCE CONFIDENTIAL DOSSIER // CASE: KIRA</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <span>TERMINAL: NPA-HQ-TOKYO</span>
          <span className="text-kira-red/80 font-bold">DEATH NOTE ARCHIVE</span>
        </div>
      </div>

      {/* Main Container: Image on Top, Enter The Notebook on Bottom */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-6">
        
        {/* TOP: Authentic Manga Poster Card */}
        <div 
          onClick={() => setShowPosterZoom(!showPosterZoom)}
          className="w-full group relative rounded-2xl overflow-hidden border-2 border-red-950/80 hover:border-kira-red transition-all duration-500 shadow-crimson-heavy bg-black/90 cursor-pointer"
        >
          {/* Ominous Crimson Lighting Glow behind poster */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity" />
          
          <img 
            src={yagamiPoster} 
            alt="Yagami Light & Ryuk - Death Note Kira Protocol"
            className="w-full h-auto max-h-[440px] sm:max-h-[500px] object-cover object-top filter grayscale contrast-125 group-hover:scale-105 group-hover:filter group-hover:grayscale-0 group-hover:contrast-110 transition-all duration-700" 
          />

          {/* Floating Death Note Kanji Badge */}
          <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-kira-red/60 px-3 py-1 rounded text-[11px] font-mono text-kira-red flex items-center gap-2 shadow-crimson">
            <Skull className="w-3.5 h-3.5 animate-pulse" />
            <span className="tracking-widest font-bold">デスノート // KIRA FILE</span>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-black via-black/90 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-crimson">
                  YAGAMI LIGHT
                </h3>
                <p className="text-xs font-mono text-gray-400 flex items-center gap-2">
                  <span className="text-kira-red font-bold">KIRA</span>
                  <span>•</span>
                  <span>GOD OF THE NEW WORLD</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-kira-red/90 border border-kira-red/40 px-2 py-0.5 rounded uppercase">
                  SUBJECT 01
                </span>
              </div>
            </div>
          </div>

          {/* Hover Tooltip Hint */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-kira-red px-3 py-1.5 rounded-full text-xs font-mono text-white flex items-center gap-1.5 shadow-crimson">
              <Eye className="w-3.5 h-3.5 text-kira-red" />
              <span>CLICK TO EXPAND DOSSIER</span>
            </div>
          </div>
        </div>

        {/* Quick Rules Navigation & Summary */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-death-surface/80 border border-death-border/80 backdrop-blur-md font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-death-border/60 pb-2">
            <span className="text-kira-red font-bold uppercase tracking-wider flex items-center gap-2">
              <Skull className="w-3.5 h-3.5" />
              HOW TO USE IT: RULES
            </span>
            <button 
              type="button"
              onClick={() => setActiveTab(activeTab === 'rules' ? 'form' : 'rules')}
              className="text-[11px] text-gray-400 hover:text-kira-red transition-colors underline cursor-pointer"
            >
              {activeTab === 'rules' ? 'HIDE RULES' : 'VIEW ALL RULES (I - IV)'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded bg-black/60 border-l-2 border-kira-red text-gray-300">
              <strong className="text-white block mb-0.5">RULE I: THE NOTEBOOK</strong>
              <p className="text-[11px] text-gray-400">10 Standard SQL MCQs. +1 PT on success. Failed queries forfeit 1 Life.</p>
            </div>

            {activeTab === 'rules' && (
              <>
                <div className="p-2.5 rounded bg-black/60 border-l-2 border-kira-red text-gray-300 animate-fade-in">
                  <strong className="text-white block mb-0.5">RULE II: KIRA'S CODE</strong>
                  <p className="text-[11px] text-gray-400">Query repair with ASK L (-1 PT hint) & Ryuk's Deal (2x risk multiplier).</p>
                </div>

                <div className="p-2.5 rounded bg-black/60 border-l-2 border-kira-red text-gray-300 animate-fade-in">
                  <strong className="text-white block mb-0.5">RULE III: SPK SURVEILLANCE</strong>
                  <p className="text-[11px] text-gray-400">Arrange missing keywords in sequential order [ 1 ] to [ 4 ] into slot trays (+4 PTS).</p>
                </div>

                <div className="p-2.5 rounded bg-black/60 border-l-2 border-kira-red text-gray-300 animate-fade-in">
                  <strong className="text-white block mb-0.5">RULE IV: L'S INVESTIGATION & ANTI-CHEAT</strong>
                  <p className="text-[11px] text-gray-400">Multi-table relational forensics, 6 binary bits decryption, and automated proctoring telemetry.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM: THE BOX WITH ONLY 'ENTER THE NOTEBOOK' BUTTON */}
        <div className="w-full relative rounded-2xl bg-death-surface/95 border-2 border-death-border hover:border-kira-red/60 shadow-crimson-heavy p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 flex flex-col items-center justify-center">
          
          {/* Top Corner Dossier Brackets */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-kira-red/80 pointer-events-none" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-kira-red/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-kira-red/80 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-kira-red/80 pointer-events-none" />

          {/* Error Banner */}
          {error && (
            <div className="w-full mb-4 p-4 rounded-xl bg-red-950/80 border border-kira-red text-kira-red text-xs font-mono flex items-center justify-center gap-3 animate-shake shadow-crimson">
              <AlertTriangle className="w-5 h-5 shrink-0 text-kira-red" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Glowing Crimson Enter Button */}
          <button
            type="button"
            onClick={handleEnterNotebook}
            disabled={loading}
            onMouseEnter={() => sounds.playHeartbeat()}
            className="w-full py-5 sm:py-6 bg-gradient-to-r from-red-950 via-kira-red to-red-900 hover:from-red-900 hover:via-red-600 hover:to-red-800 text-white font-bold rounded-xl tracking-widest uppercase gothic-title text-lg sm:text-xl transition-all shadow-crimson hover:shadow-crimson-heavy flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer border border-kira-glow/60 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen className="w-6 h-6 text-white animate-pulse" />
            <span>{loading ? 'INITIALIZING PROTOCOL...' : 'ENTER THE NOTEBOOK'}</span>
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="mt-3 text-[11px] font-mono text-gray-400 tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-kira-red animate-pulse" />
            <span>45:00 KIRA COUNTDOWN & FULLSCREEN PROTOCOL COMMENCE UPON ENTRY</span>
          </div>

        </div>

      </div>

      {/* Poster Zoom Modal Overlay */}
      {showPosterZoom && (
        <div 
          onClick={() => setShowPosterZoom(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-xl w-full max-h-[90vh] overflow-hidden rounded-2xl border-2 border-kira-red shadow-crimson-heavy p-2 bg-black">
            <img 
              src={yagamiPoster} 
              alt="Yagami Light Full Poster"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl mx-auto"
            />
            <p className="text-center font-mono text-xs text-gray-400 mt-2">
              CLICK ANYWHERE TO CLOSE DOSSIER
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

