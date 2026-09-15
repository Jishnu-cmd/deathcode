import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Maximize2, Minimize2, Search, RefreshCw, EyeOff, Shield, ExternalLink } from 'lucide-react';
import { fetchLeaderboard } from '../services/api';
import { sounds } from '../services/audio';

const WINNER_FORM_URL = 'https://forms.gle/u1fEfRawSJYWGRDE7';

export default function Leaderboard({ isAdmin = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectorMode, setProjectorMode] = useState(false);
  const [search, setSearch] = useState('');
  const isWinner = typeof window !== 'undefined' && localStorage.getItem('death_code_winner') === 'true';

  const loadLeaderboard = async () => {
    try {
      const res = await fetchLeaderboard(isAdmin);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 4000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const filteredList = data?.leaderboard?.filter((team) =>
    team.team_name.toLowerCase().includes(search.toLowerCase()) ||
    (team.college && team.college.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className={`p-4 sm:p-6 transition-all ${projectorMode ? 'fixed inset-0 z-50 bg-black overflow-y-auto' : 'max-w-6xl mx-auto'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-death-border">
        <div>
          <div className="flex items-center gap-2 text-kira-red font-mono text-xs uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4" />
            <span>NATIONAL TASK FORCE RANKINGS</span>
          </div>
          <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-crimson">
            LIVE LEADERBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by team / college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-death-surface border border-death-border text-xs font-mono text-white focus:outline-none focus:border-kira-red w-48 sm:w-64"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              sounds.playKey();
              loadLeaderboard();
            }}
            className="p-2 rounded-lg bg-death-card border border-death-border text-gray-300 hover:text-white"
            title="Refresh Leaderboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Projector Mode Toggle */}
          <button
            onClick={() => {
              sounds.playKey();
              setProjectorMode(!projectorMode);
            }}
            className="px-3 py-2 rounded-lg bg-death-card border border-death-border text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
            title="Toggle Fullscreen Projector Mode"
          >
            {projectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{projectorMode ? 'EXIT PROJECTOR' : 'PROJECTOR MODE'}</span>
          </button>
        </div>
      </div>

      {/* Winner Banner if participant solved the Kira Case */}
      {isWinner && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-yellow-950/90 via-black to-yellow-950/90 border-2 border-yellow-400 shadow-xl shadow-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
            <div className="text-left font-mono">
              <div className="text-yellow-400 font-bold text-sm tracking-wider flex items-center gap-2">
                <span>🏆 CASE SOLVED — KIRA APPREHENDED!</span>
              </div>
              <div className="text-gray-300 text-xs mt-0.5">
                Congratulations! You cracked the case and defeated Kira. Please submit the official winner form.
              </div>
            </div>
          </div>
          <a
            href={WINNER_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playBell()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-yellow-500/30 cursor-pointer border border-yellow-200 hover:scale-105"
          >
            <Trophy className="w-4 h-4 text-black shrink-0" />
            <span>SUBMIT WINNER FORM</span>
            <ExternalLink className="w-4 h-4 text-black shrink-0" />
          </a>
        </div>
      )}

      {/* Suspense Mode Alert */}
      {data?.suspense_mode && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-950/60 via-death-surface to-red-950/60 border border-kira-red/50 flex items-center gap-3 font-mono text-xs text-kira-red shadow-crimson">
          <EyeOff className="w-5 h-5 shrink-0 animate-pulse" />
          <div>
            <strong className="block text-white uppercase tracking-wider mb-0.5">ROUND 3 SUSPENSE PROTOCOL ACTIVE:</strong>
            <span>Exact point values are masked during the final investigation round to prevent preemptive calculations. Rankings remain strictly chronological and accurate.</span>
          </div>
        </div>
      )}

      {/* Top 3 Podium (when not in search) */}
      {!search && filteredList.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 max-w-3xl mx-auto items-end">
          
          {/* 2nd Place */}
          <div className="bg-death-card border border-gray-600/60 p-4 rounded-xl text-center space-y-2 order-1 shadow-lg">
            <div className="w-8 h-8 mx-auto rounded-full bg-gray-400 text-black font-bold flex items-center justify-center text-sm">
              2
            </div>
            <div className="font-mono text-sm font-bold text-white truncate">
              {filteredList[1]?.team_name}
            </div>
            <div className="text-[11px] font-mono text-gray-400 truncate">
              {filteredList[1]?.college || 'Detective Unit'}
            </div>
            <div className="text-xs font-mono font-bold text-gray-300">
              {filteredList[1]?.score} PTS
            </div>
          </div>

          {/* 1st Place Champion */}
          <div className="bg-gradient-to-b from-yellow-950/50 via-death-card to-death-card border-2 border-yellow-500/80 p-5 rounded-xl text-center space-y-2 order-2 shadow-2xl scale-105">
            <div className="w-10 h-10 mx-auto rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base shadow-lg shadow-yellow-500/30">
              👑
            </div>
            <div className="gothic-title text-base font-bold text-yellow-300 truncate">
              {filteredList[0]?.team_name}
            </div>
            <div className="text-[11px] font-mono text-gray-300 truncate">
              {filteredList[0]?.college || 'Chief Detective'}
            </div>
            <div className="text-sm font-mono font-bold text-yellow-400">
              {filteredList[0]?.score} PTS
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-death-card border border-amber-800/60 p-4 rounded-xl text-center space-y-2 order-3 shadow-lg">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <div className="font-mono text-sm font-bold text-white truncate">
              {filteredList[2]?.team_name}
            </div>
            <div className="text-[11px] font-mono text-gray-400 truncate">
              {filteredList[2]?.college || 'Investigator'}
            </div>
            <div className="text-xs font-mono font-bold text-gray-300">
              {filteredList[2]?.score} PTS
            </div>
          </div>

        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-death-card border border-death-border rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-death-surface text-gray-400 uppercase text-[10px] border-b border-death-border">
            <tr>
              <th className="p-3.5 text-center w-16">RANK</th>
              <th className="p-3.5">TEAM / DETECTIVE</th>
              <th className="p-3.5 hidden md:table-cell">COLLEGE</th>
              <th className="p-3.5 text-center">LIVES</th>
              <th className="p-3.5 text-center hidden lg:table-cell">ROUNDS (1-4)</th>
              <th className="p-3.5 text-center">STATUS</th>
              <th className="p-3.5 text-center">BITS</th>
              <th className="p-3.5 text-right font-bold w-24">SCORE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-death-border/50 text-gray-300">
            {filteredList.map((team, idx) => (
              <tr key={idx} className={`hover:bg-death-surface/80 transition-colors ${team.is_eliminated === 1 ? 'bg-red-950/20' : ''}`}>
                
                {/* Rank Badge */}
                <td className="p-3.5 text-center font-bold">
                  {team.rank === 1 && <span className="text-yellow-400 text-sm">🥇 #1</span>}
                  {team.rank === 2 && <span className="text-gray-300 text-sm">🥈 #2</span>}
                  {team.rank === 3 && <span className="text-amber-600 text-sm">🥉 #3</span>}
                  {team.rank > 3 && <span className="text-gray-400">#{team.rank}</span>}
                </td>

                {/* Team Name */}
                <td className="p-3.5 font-bold text-white">
                  <div className="flex items-center gap-2">
                    {team.is_eliminated === 1 && <span className="text-xs">💀</span>}
                    <span className={team.is_eliminated === 1 ? 'line-through text-red-400' : ''}>{team.team_name}</span>
                  </div>
                </td>

                {/* College */}
                <td className="p-3.5 text-gray-400 hidden md:table-cell">
                  {team.college || '—'}
                </td>

                {/* Lives Meter */}
                <td className="p-3.5 text-center font-mono">
                  {team.is_eliminated === 1 || team.lives <= 0 ? (
                    <span className="text-red-500 font-bold bg-red-950/60 border border-red-900 px-2 py-0.5 rounded text-[10px]">
                      0/10 💀
                    </span>
                  ) : (
                    <span className="text-pink-400 font-semibold bg-pink-950/30 border border-pink-900/50 px-2 py-0.5 rounded text-[10px]">
                      {team.lives}/10 ❤️
                    </span>
                  )}
                </td>

                {/* Rounds Breakdown (R1-R4) */}
                <td className="p-3.5 text-center font-mono text-[11px] text-gray-400 hidden lg:table-cell">
                  <span className="text-gray-300 font-semibold" title="Round 1">{team.round1_score || 0}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="text-gray-300 font-semibold" title="Round 2">{team.round2_score || 0}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="text-cyan-400 font-semibold" title="Round 3">{team.round3_score || 0}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="text-yellow-400 font-semibold" title="Round 4">{team.round4_score || 0}</span>
                </td>

                {/* Status */}
                <td className="p-3.5 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                    team.is_eliminated === 1 || team.status.includes('DECEASED')
                      ? 'bg-red-950/80 border-kira-red text-kira-red shadow-crimson animate-pulse'
                      : team.status.includes('ARRESTED') || team.status.includes('IDENTIFIED')
                      ? 'bg-red-950/60 border-kira-red text-kira-red shadow-crimson'
                      : 'bg-green-950/40 border-green-800 text-green-400'
                  }`}>
                    {team.status}
                  </span>
                </td>

                {/* Binary Bits */}
                <td className="p-3.5 text-center font-mono tracking-widest text-l-cyan">
                  {team.binary_bits || '______'}
                </td>

                {/* Total Score */}
                <td className="p-3.5 text-right font-bold text-sm text-white">
                  {team.score}
                </td>
              </tr>
            ))}

            {filteredList.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 font-mono">
                  No investigator records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
