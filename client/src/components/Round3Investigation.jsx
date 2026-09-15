import React, { useState } from 'react';
import { Shield, Database, Search, Terminal, Lock, Unlock, Play, CheckCircle, AlertOctagon, Sparkles, Trophy } from 'lucide-react';
import { executeSqlQuery, submitClueAnswer, submitFinalCriminal } from '../services/api';
import { sounds } from '../services/audio';

export default function Round3Investigation({
  participant,
  roundData,
  onUpdateParticipant,
  onCinematicComplete
}) {
  const [activeTableTab, setActiveTableTab] = useState('suspects');
  const [sqlInput, setSqlInput] = useState('SELECT * FROM suspects WHERE city = \'Tokyo\';');
  const [sqlResults, setSqlResults] = useState(null);
  const [sqlError, setSqlError] = useState(null);
  const [runningSql, setRunningSql] = useState(false);

  const [activeClueIndex, setActiveClueIndex] = useState(0);
  const [selectedClueOption, setSelectedClueOption] = useState('');
  const [clueSubmitting, setClueSubmitting] = useState(false);

  const [accuseSuspectCode, setAccuseSuspectCode] = useState('S1');
  const [accusing, setAccusing] = useState(false);

  const { caseData, clues, tables } = roundData || {};
  const binaryBits = (participant?.binary_bits || '______').split('');

  // Calculate decimal equivalent and check if at least 3 out of 6 secret codes are cleared
  const currentBitString = binaryBits.join('');
  const clearedBitsCount = binaryBits.filter((b) => b === '0' || b === '1').length;
  const isAllBitsUnlocked = clearedBitsCount >= 3;
  const decimalVal = !currentBitString.includes('_') ? parseInt(currentBitString, 2) : (clearedBitsCount > 0 ? `${clearedBitsCount}/6` : '??');

  const handleRunQuery = async () => {
    if (!sqlInput.trim() || runningSql) return;
    setRunningSql(true);
    setSqlError(null);
    try {
      sounds.playKey();
      const res = await executeSqlQuery(participant.reg_id, sqlInput);
      setSqlResults(res.rows);
    } catch (err) {
      setSqlError(err.message || 'Query execution error');
      sounds.playError();
    } finally {
      setRunningSql(false);
    }
  };

  const handleClueSubmit = async (clueId) => {
    if (!selectedClueOption || clueSubmitting) return;

    setClueSubmitting(true);
    try {
      const res = await submitClueAnswer(participant.reg_id, clueId, selectedClueOption);
      if (res.is_correct) {
        sounds.playSuccess();
      } else {
        sounds.playError();
      }

      onUpdateParticipant({
        score: res.new_score,
        binary_bits: res.binary_bits,
        lives: res.new_lives !== undefined ? res.new_lives : participant.lives,
        is_eliminated: res.is_eliminated !== undefined ? res.is_eliminated : participant.is_eliminated
      });
      setSelectedClueOption('');
    } catch (err) {
      alert(err.message || 'Clue submission error');
    } finally {
      setClueSubmitting(false);
    }
  };

  const handleFinalAccusation = async () => {
    if (!isAllBitsUnlocked) {
      alert(`Only after clearing at least 3 out of 6 secret codes can you win! Currently cleared: ${clearedBitsCount} / 3.`);
      return;
    }
    if (!accuseSuspectCode || accusing) return;

    if (!confirm(`Are you certain that suspect ${accuseSuspectCode} is Kira? This final accusation concludes your investigation!`)) {
      return;
    }

    setAccusing(true);
    try {
      sounds.playBell();
      const res = await submitFinalCriminal(
        participant.reg_id,
        accuseSuspectCode,
        currentBitString
      );

      onUpdateParticipant({
        score: res.final_score,
        is_completed: 1,
        identified_kira_code: accuseSuspectCode,
        lives: res.new_lives !== undefined ? res.new_lives : participant.lives,
        is_eliminated: res.is_eliminated !== undefined ? res.is_eliminated : participant.is_eliminated
      });

      // Launch cinematic sequence
      onCinematicComplete(res);
    } catch (err) {
      alert(err.message || 'Accusation processing failed');
    } finally {
      setAccusing(false);
    }
  };

  if (!roundData || !tables) {
    return (
      <div className="p-12 text-center font-mono text-gray-400">
        Accessing Special Investigation Headquarters Database...
      </div>
    );
  }

  const activeClue = clues && clues[activeClueIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Case Card & 6-Bit Binary Register */}
      <div className="bg-death-surface border border-death-border p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-l-cyan font-mono text-xs uppercase tracking-widest mb-1">
              <Shield className="w-4 h-4" />
              <span>ROUND 4 // L'S SPECIAL INVESTIGATION HEADQUARTERS</span>
            </div>
            <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-wider glow-cyan">
              {caseData?.story_title || "THE KANTO JUDGMENT CASE"}
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1 max-w-2xl">
              {caseData?.description}
            </p>
          </div>

          {/* Missing 6-Bit Register HUD */}
          <div className="bg-black/80 border border-l-cyan/40 p-4 rounded-xl shadow-l-glow flex flex-col items-center shrink-0">
            <div className="flex items-center justify-between w-full mb-2 gap-3">
              <span className="text-[10px] font-mono text-l-cyan uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                6 SECRET CODES
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isAllBitsUnlocked ? 'bg-green-950 text-green-300 border border-green-500' : 'bg-cyan-950 text-l-cyan'
              }`}>
                {clearedBitsCount} / 6 CLEARED
              </span>
            </div>

            {/* 6 Bits Display */}
            <div className="flex items-center gap-2 mb-2 font-mono">
              {binaryBits.map((bit, idx) => (
                <div
                  key={idx}
                  className={`w-9 h-12 rounded-lg border-2 flex flex-col items-center justify-center font-bold text-lg transition-all ${
                    bit !== '_'
                      ? 'bg-cyan-950/80 border-l-cyan text-l-cyan shadow-l-glow'
                      : 'bg-death-card border-death-border text-gray-600'
                  }`}
                >
                  <span>{bit}</span>
                  <span className="text-[8px] text-gray-500">B{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-gray-400">
              DECIMAL EQUIVALENT: <strong className="text-white font-bold">{decimalVal}</strong> / 63
            </div>
          </div>
        </div>
      </div>

      {/* Main Investigation Workbench: Tables + SQL Console + Clues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Multi-Table Evidence Explorer & SQL Console */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Table Viewer */}
          <div className="bg-death-card border border-death-border rounded-xl shadow-xl overflow-hidden">
            {/* Table Tabs */}
            <div className="flex items-center border-b border-death-border bg-death-surface/80 px-4 pt-3 gap-2 overflow-x-auto">
              {[
                { key: 'suspects', label: 'SUSPECTS' },
                { key: 'login_logs', label: 'LOGIN_LOG' },
                { key: 'crime_records', label: 'CRIME_RECORD' },
                { key: 'transactions', label: 'TRANSACTIONS' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    sounds.playKey();
                    setActiveTableTab(tab.key);
                  }}
                  className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all border-t border-x ${
                    activeTableTab === tab.key
                      ? 'bg-death-card text-l-cyan border-l-cyan/50 shadow-l-glow'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table Data Render */}
            <div className="p-4 overflow-x-auto max-h-72">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-death-border text-gray-400 uppercase text-[10px]">
                    {tables[activeTableTab] && tables[activeTableTab][0] && Object.keys(tables[activeTableTab][0]).map((col) => (
                      <th key={col} className="p-2">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-death-border/50 text-gray-300">
                  {tables[activeTableTab]?.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-cyan-950/20 transition-colors">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className="p-2 whitespace-nowrap">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive SQL Query Console */}
          <div className="bg-death-card border border-death-border p-5 rounded-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-l-cyan" />
                INTERACTIVE SQL QUERY CONSOLE (READ-ONLY)
              </span>
              <span className="text-[10px] text-gray-500">Query the active investigation tables</span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="Write SELECT query on suspects, login_logs, crime_records, or transactions..."
                className="w-full p-3 bg-black/90 border border-death-border focus:border-l-cyan rounded-lg font-mono text-xs text-green-300 focus:outline-none shadow-inner"
              />
              <button
                onClick={handleRunQuery}
                disabled={runningSql}
                className="absolute bottom-3 right-3 px-4 py-1.5 bg-l-cyan hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded shadow-l-glow flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{runningSql ? 'RUNNING...' : 'EXECUTE'}</span>
              </button>
            </div>

            {sqlError && (
              <div className="p-2.5 rounded bg-red-950/50 border border-red-800 text-red-300 font-mono text-xs">
                {sqlError}
              </div>
            )}

            {/* SQL Results Table */}
            {sqlResults && (
              <div className="mt-3 p-3 rounded-lg bg-black/80 border border-death-border overflow-x-auto max-h-52">
                <div className="text-[10px] font-mono text-gray-400 mb-1">
                  QUERY OUTPUT ({sqlResults.length} rows returned):
                </div>
                {sqlResults.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 italic">0 rows matching query criteria.</p>
                ) : (
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-death-border text-gray-400 text-[10px]">
                        {Object.keys(sqlResults[0]).map((k) => (
                          <th key={k} className="p-1.5 uppercase">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-death-border/40 text-green-400">
                      {sqlResults.map((r, i) => (
                        <tr key={i}>
                          {Object.values(r).map((v, ci) => (
                            <td key={ci} className="p-1.5 whitespace-nowrap">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right 5 Cols: Clues Matrix & Final Accusation */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clues Accordion & Question */}
          <div className="bg-death-card border border-death-border p-6 rounded-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-death-border font-mono text-xs">
              <span className="font-bold text-gray-300">INVESTIGATION CLUES</span>
              <span className="text-l-cyan">CLUE #{activeClue?.clue_number} of {clues?.length}</span>
            </div>

            {/* Clue Selection Tabs */}
            <div className="grid grid-cols-6 gap-1.5">
              {clues?.map((c, idx) => {
                const isSelected = idx === activeClueIndex;
                const isSolved = c.is_solved;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      sounds.playKey();
                      setActiveClueIndex(idx);
                      setSelectedClueOption('');
                    }}
                    className={`py-2 rounded-lg border font-mono text-xs flex flex-col items-center gap-0.5 transition-all ${
                      isSelected
                        ? 'border-l-cyan bg-cyan-950/60 text-white font-bold ring-1 ring-l-cyan'
                        : isSolved
                        ? 'border-green-600/60 bg-green-950/30 text-green-300'
                        : 'border-death-border bg-death-surface text-gray-400'
                    }`}
                  >
                    <span>C{c.clue_number}</span>
                    {isSolved ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-gray-500" />}
                  </button>
                );
              })}
            </div>

            {/* Active Clue Content */}
            {activeClue && (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-lg bg-black/60 border-l-4 border-l-cyan text-xs font-mono text-cyan-200 leading-relaxed">
                  <strong className="block text-white uppercase tracking-wider mb-0.5">CLUE #{activeClue.clue_number}:</strong>
                  {activeClue.clue_text}
                </div>

                <p className="font-mono text-xs text-white font-semibold leading-relaxed">
                  {activeClue.question_text}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {[
                    { letter: 'A', text: activeClue.option_a },
                    { letter: 'B', text: activeClue.option_b },
                    { letter: 'C', text: activeClue.option_c },
                    { letter: 'D', text: activeClue.option_d }
                  ].map((opt) => {
                    const isSelected = selectedClueOption === opt.letter;
                    return (
                      <button
                        key={opt.letter}
                        disabled={activeClue.is_solved}
                        onClick={() => {
                          sounds.playKey();
                          setSelectedClueOption(opt.letter);
                        }}
                        className={`w-full p-3 rounded-lg border text-left font-mono text-xs flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-l-cyan bg-cyan-950/50 text-white'
                            : 'border-death-border bg-death-surface/60 hover:bg-death-surface text-gray-300'
                        } ${activeClue.is_solved ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-l-cyan text-black' : 'bg-black/70 text-gray-400 border border-death-border'
                        }`}>
                          {opt.letter}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {activeClue.is_solved ? (
                  <div className="p-3 rounded-lg bg-green-950/40 border border-green-700/60 text-green-300 font-mono text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Clue solved! Bit {activeClue.clue_number} unlocked: <strong>[{activeClue.unlocked_bit}]</strong> (+3 PTS)</span>
                  </div>
                ) : (
                  <button
                    disabled={!selectedClueOption || clueSubmitting}
                    onClick={() => handleClueSubmit(activeClue.id)}
                    className="w-full py-2.5 bg-l-cyan hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-lg shadow-l-glow transition-all disabled:opacity-40"
                  >
                    {clueSubmitting ? 'VERIFYING EVIDENCE...' : 'EXTRACT BIT CODE (+3 PTS)'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Final Accusation Box */}
          <div className={`p-6 rounded-xl space-y-4 border-2 transition-all ${
            isAllBitsUnlocked 
              ? 'bg-gradient-to-br from-green-950/40 via-black to-death-card border-green-500 shadow-green-500/20 shadow-2xl' 
              : 'bg-gradient-to-br from-red-950/80 via-black to-death-card border-kira-red shadow-crimson'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-kira-red font-mono text-xs font-bold uppercase tracking-wider">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
                <span>FINAL TRIAL: NAME KIRA</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isAllBitsUnlocked 
                  ? 'border-green-500 bg-green-950 text-green-300' 
                  : 'border-yellow-600/60 bg-yellow-950/50 text-yellow-300'
              }`}>
                {isAllBitsUnlocked ? 'UNLOCKED TO WIN' : `${clearedBitsCount}/6 CLEARED (NEED 3)`}
              </span>
            </div>

            {!isAllBitsUnlocked ? (
              <div className="p-3 rounded-lg bg-yellow-950/40 border border-yellow-700/60 text-yellow-300 font-mono text-xs space-y-1">
                <strong className="block text-white flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  WIN CONDITION: CLEAR AT LEAST 3 OUT OF 6 SECRET CODES
                </strong>
                <p className="text-[11px] text-yellow-200/80 leading-relaxed">
                  You must clear at least 3 out of 6 secret codes ({clearedBitsCount}/3 unlocked) before the final Kira accusation is unlocked to win!
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-green-950/50 border border-green-600/80 text-green-300 font-mono text-xs animate-fade-in">
                <strong className="block text-white flex items-center gap-1.5 font-bold">
                  <Unlock className="w-3.5 h-3.5 text-green-400" />
                  SECRET CODE THRESHOLD REACHED ({clearedBitsCount}/6 CLEARED)!
                </strong>
                <p className="text-[11px] text-green-200/90 leading-relaxed">
                  You have decoded {clearedBitsCount}/6 secret bits [{currentBitString}]. Select the matching suspect to arrest Kira and win!
                </p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                PRIMARY ACCUSED SUSPECT
              </label>
              <select
                disabled={!isAllBitsUnlocked}
                value={accuseSuspectCode}
                onChange={(e) => setAccuseSuspectCode(e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-mono text-xs focus:outline-none transition-all ${
                  isAllBitsUnlocked 
                    ? 'bg-death-surface border-green-600/80 text-white focus:border-green-400' 
                    : 'bg-black/60 border-death-border text-gray-500 cursor-not-allowed'
                }`}
              >
                {tables.suspects?.map((s) => (
                  <option key={s.suspect_code} value={s.suspect_code}>
                    {s.suspect_code} — {s.name} ({s.occupation}, {s.city})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFinalAccusation}
              disabled={!isAllBitsUnlocked || accusing || participant.is_completed === 1}
              className={`w-full py-3.5 font-mono font-bold text-xs tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                !isAllBitsUnlocked
                  ? 'bg-gray-800/80 text-gray-500 border border-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-900 via-green-600 to-emerald-700 hover:from-green-800 hover:to-emerald-600 text-white shadow-green-500/30 shadow-lg cursor-pointer transform hover:-translate-y-0.5'
              }`}
            >
              {!isAllBitsUnlocked ? (
                <>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>CLEAR 3 OUT OF 6 SECRET CODES TO WIN ({clearedBitsCount} / 3)</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>{accusing ? 'ANALYZING TRIAL...' : 'EXECUTE KIRA ARREST & WIN (+10 PTS)'}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
