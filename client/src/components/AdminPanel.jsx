import React, { useState, useEffect } from 'react';
import { Terminal, Play, Pause, FastForward, RotateCcw, Clock, ShieldCheck, Download, Plus, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import {
  fetchAdminOverview,
  updateEventStatus,
  updateEventTimer,
  updateEventToggles,
  fetchAdminQuestions,
  addAdminQuestion,
  deleteAdminQuestion
} from '../services/api';
import { sounds } from '../services/audio';

export default function AdminPanel() {
  const [overview, setOverview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'questions' | 'audit'

  // Question bank filters
  const [qRoundFilter, setQRoundFilter] = useState('');
  const [qCatFilter, setQCatFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');

  // Add Question Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newQ, setNewQ] = useState({
    round_id: 1,
    category: 'SELECT',
    difficulty: 'medium',
    concept: '',
    question_text: '',
    code_snippet: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    points: 1,
    hint_text: '',
    explanation: ''
  });

  const loadOverview = async () => {
    try {
      const res = await fetchAdminOverview();
      setOverview(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await fetchAdminQuestions(qRoundFilter, qCatFilter);
      setQuestions(res.questions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([loadOverview(), loadQuestions()]).finally(() => setLoading(false));
    const interval = setInterval(loadOverview, 4000);
    return () => clearInterval(interval);
  }, [qRoundFilter, qCatFilter]);

  const handleStatusChange = async (status, isPaused = 0) => {
    sounds.playKey();
    await updateEventStatus(status, isPaused);
    loadOverview();
  };

  const handleTimerSet = async (minutes) => {
    sounds.playKey();
    await updateEventTimer(minutes);
    loadOverview();
  };

  const handleToggle = async (toggles) => {
    sounds.playKey();
    await updateEventToggles(toggles);
    loadOverview();
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      sounds.playSuccess();
      await addAdminQuestion(newQ);
      setAddModalOpen(false);
      loadQuestions();
    } catch (err) {
      alert(err.message || 'Failed to add question');
    }
  };

  const handleDeleteQ = async (id) => {
    if (!confirm(`Permanently delete Question #${id}?`)) return;
    try {
      sounds.playKey();
      await deleteAdminQuestion(id);
      loadQuestions();
    } catch (err) {
      alert(err.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-gray-400">
        Connecting to Organizer Command Console...
      </div>
    );
  }

  const event = overview?.event;
  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(searchQ.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-death-border">
        <div>
          <div className="flex items-center gap-2 text-l-cyan font-mono text-xs uppercase tracking-widest mb-1">
            <Terminal className="w-4 h-4" />
            <span>SPECIAL INVESTIGATION COMMAND</span>
          </div>
          <h1 className="gothic-title text-2xl sm:text-3xl font-bold text-white tracking-widest glow-cyan">
            ORGANIZER COMMAND CENTER
          </h1>
        </div>

        {/* CSV Export */}
        <a
          href="/api/admin/export/csv"
          download="death_code_results.csv"
          className="px-4 py-2 bg-gradient-to-r from-red-950 to-kira-red hover:from-red-900 hover:to-red-600 text-white font-mono text-xs font-bold rounded-lg shadow-crimson flex items-center gap-2 transition-all w-fit"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV REPORT</span>
        </a>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-death-card border border-death-border p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase">ACTIVE PARTICIPANTS</span>
          <div className="text-2xl font-bold text-white mt-1">{overview?.total_participants || 0}</div>
        </div>
        <div className="bg-death-card border border-death-border p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase">COMPLETED CASES</span>
          <div className="text-2xl font-bold text-l-cyan mt-1">{overview?.completed_participants || 0}</div>
        </div>
        <div className="bg-death-card border border-death-border p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase">AVERAGE SCORE</span>
          <div className="text-2xl font-bold text-green-400 mt-1">{overview?.average_score || 0} PTS</div>
        </div>
        <div className="bg-death-card border border-death-border p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase">EVENT STATUS</span>
          <div className="text-sm font-bold text-kira-red mt-2 uppercase">{event?.status}</div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-3 border-b border-death-border pb-2 font-mono text-xs">
        <button
          onClick={() => { sounds.playKey(); setActiveTab('controls'); }}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'controls' ? 'bg-l-cyan text-black font-bold shadow-l-glow' : 'bg-death-card text-gray-300'
          }`}
        >
          EVENT CONTROLS & TIMERS
        </button>
        <button
          onClick={() => { sounds.playKey(); setActiveTab('questions'); }}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'questions' ? 'bg-l-cyan text-black font-bold shadow-l-glow' : 'bg-death-card text-gray-300'
          }`}
        >
          QUESTION BANK ({questions.length})
        </button>
        <button
          onClick={() => { sounds.playKey(); setActiveTab('audit'); }}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'audit' ? 'bg-l-cyan text-black font-bold shadow-l-glow' : 'bg-death-card text-gray-300'
          }`}
        >
          SURVEILLANCE LOGS ({overview?.recent_logs?.length || 0})
        </button>
      </div>

      {/* TAB 1: EVENT CONTROLS */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          
          {/* Round State Machine Controls */}
          <div className="bg-death-card border border-death-border p-6 rounded-xl space-y-4">
            <h3 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider">
              ROUND STATE MACHINE TRANSITIONS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs font-bold">
              <button
                onClick={() => handleStatusChange('ROUND_1')}
                className="p-3 bg-red-950/60 hover:bg-kira-red border border-kira-red text-white rounded-lg transition-all flex flex-col items-center gap-1 shadow-crimson"
              >
                <Play className="w-4 h-4" />
                <span>START ROUND 1</span>
              </button>
              <button
                onClick={() => handleStatusChange('ROUND_2')}
                className="p-3 bg-cyan-950/60 hover:bg-l-cyan hover:text-black border border-l-cyan text-l-cyan rounded-lg transition-all flex flex-col items-center gap-1 shadow-l-glow"
              >
                <FastForward className="w-4 h-4" />
                <span>START ROUND 2</span>
              </button>
              <button
                onClick={() => handleStatusChange('ROUND_3')}
                className="p-3 bg-purple-950/60 hover:bg-purple-600 border border-purple-500 text-white rounded-lg transition-all flex flex-col items-center gap-1"
              >
                <FastForward className="w-4 h-4" />
                <span>START ROUND 3</span>
              </button>
              <button
                onClick={() => handleStatusChange(event?.status, event?.is_paused ? 0 : 1)}
                className={`p-3 border rounded-lg transition-all flex flex-col items-center gap-1 ${
                  event?.is_paused
                    ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300 animate-pulse'
                    : 'bg-death-surface border-death-border text-gray-300'
                }`}
              >
                <Pause className="w-4 h-4" />
                <span>{event?.is_paused ? 'RESUME EVENT' : 'PAUSE EVENT'}</span>
              </button>
              <button
                onClick={() => handleStatusChange('ENDED')}
                className="p-3 bg-black border border-gray-700 hover:border-kira-red text-gray-400 hover:text-kira-red rounded-lg transition-all flex flex-col items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>CONCLUDE EVENT</span>
              </button>
            </div>
          </div>

          {/* Quick Timer Override */}
          <div className="bg-death-card border border-death-border p-6 rounded-xl space-y-4">
            <h3 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-l-cyan" />
              QUICK TIMER OVERRIDE (SET REMAINING TIME)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs font-bold">
              {[45, 30, 18, 5].map((min) => (
                <button
                  key={min}
                  onClick={() => handleTimerSet(min)}
                  className="py-2.5 px-4 bg-death-surface border border-death-border hover:border-l-cyan text-gray-300 hover:text-white rounded-lg transition-all"
                >
                  SET TO {min} MINUTES
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-death-card border border-death-border p-6 rounded-xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-gray-300 uppercase tracking-wider">
              PROTOCOL FEATURE TOGGLES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-death-surface border border-death-border flex items-center justify-between">
                <div>
                  <strong className="text-white block">ROUND 3 SUSPENSE MODE</strong>
                  <span className="text-[11px] text-gray-400">Masks exact point scores during Round 3</span>
                </div>
                <button
                  onClick={() => handleToggle({ suspense_mode: event?.suspense_mode ? 0 : 1 })}
                  className={`px-3 py-1.5 rounded font-bold ${
                    event?.suspense_mode ? 'bg-kira-red text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {event?.suspense_mode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-death-surface border border-death-border flex items-center justify-between">
                <div>
                  <strong className="text-white block">ANTI-CHEAT SURVEILLANCE</strong>
                  <span className="text-[11px] text-gray-400">Logs tab-switches and displays warning modal</span>
                </div>
                <button
                  onClick={() => handleToggle({ anti_cheat_enabled: event?.anti_cheat_enabled ? 0 : 1 })}
                  className={`px-3 py-1.5 rounded font-bold ${
                    event?.anti_cheat_enabled ? 'bg-l-cyan text-black' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {event?.anti_cheat_enabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUESTION BANK MANAGER */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg bg-death-card border border-death-border text-white w-full focus:outline-none"
                />
              </div>

              <select
                value={qRoundFilter}
                onChange={(e) => setQRoundFilter(e.target.value)}
                className="py-2 px-3 rounded-lg bg-death-card border border-death-border text-white"
              >
                <option value="">All Rounds</option>
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
              </select>
            </div>

            <button
              onClick={() => { sounds.playKey(); setAddModalOpen(true); }}
              className="px-4 py-2 bg-l-cyan hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ADD QUESTION</span>
            </button>
          </div>

          {/* Questions Table */}
          <div className="bg-death-card border border-death-border rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-death-surface text-gray-400 uppercase text-[10px] border-b border-death-border sticky top-0">
                <tr>
                  <th className="p-3 w-12">#</th>
                  <th className="p-3 w-20">ROUND</th>
                  <th className="p-3 w-28">CATEGORY</th>
                  <th className="p-3">QUESTION</th>
                  <th className="p-3 w-16 text-center">ANS</th>
                  <th className="p-3 w-16 text-center">PTS</th>
                  <th className="p-3 w-12 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-death-border/40 text-gray-300">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-death-surface/60">
                    <td className="p-3 text-gray-500">{q.id}</td>
                    <td className="p-3">R{q.round_id}</td>
                    <td className="p-3 text-l-cyan font-bold">{q.category}</td>
                    <td className="p-3">
                      <p className="font-semibold text-white line-clamp-1">{q.question_text}</p>
                      {q.code_snippet && (
                        <code className="text-[10px] text-green-400 truncate block mt-0.5">{q.code_snippet}</code>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold text-yellow-400">{q.correct_option}</td>
                    <td className="p-3 text-center">{q.points}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteQ(q.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SURVEILLANCE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-death-card border border-death-border rounded-xl p-6 space-y-4">
          <h3 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-kira-red" />
            LIVE ANTI-CHEAT INFRACTION STREAM
          </h3>

          <div className="divide-y divide-death-border/50 font-mono text-xs max-h-[500px] overflow-y-auto">
            {overview?.recent_logs?.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-kira-red font-bold mr-2">[{log.event_type}]</span>
                  <span className="text-white font-semibold mr-2">{log.team_name} ({log.reg_id})</span>
                  <span className="text-gray-400">{log.details}</span>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">{log.created_at}</span>
              </div>
            ))}

            {overview?.recent_logs?.length === 0 && (
              <p className="text-gray-500 italic p-4 text-center">No infractions recorded yet. All participants compliant.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-death-card border border-death-border rounded-xl p-6 font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase">ADD NEW QUESTION</h3>
            
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">ROUND</label>
                  <select
                    value={newQ.round_id}
                    onChange={(e) => setNewQ({ ...newQ, round_id: Number(e.target.value) })}
                    className="w-full bg-death-surface border border-death-border rounded p-2 text-white"
                  >
                    <option value={1}>Round 1</option>
                    <option value={2}>Round 2</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">CATEGORY</label>
                  <input
                    type="text"
                    required
                    value={newQ.category}
                    onChange={(e) => setNewQ({ ...newQ, category: e.target.value })}
                    className="w-full bg-death-surface border border-death-border rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">POINTS</label>
                  <input
                    type="number"
                    value={newQ.points}
                    onChange={(e) => setNewQ({ ...newQ, points: Number(e.target.value) })}
                    className="w-full bg-death-surface border border-death-border rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">QUESTION TEXT</label>
                <textarea
                  rows={2}
                  required
                  value={newQ.question_text}
                  onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
                  className="w-full bg-death-surface border border-death-border rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">CODE SNIPPET (OPTIONAL)</label>
                <textarea
                  rows={2}
                  value={newQ.code_snippet}
                  onChange={(e) => setNewQ({ ...newQ, code_snippet: e.target.value })}
                  className="w-full bg-death-surface border border-death-border rounded p-2 text-green-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A"
                  required
                  value={newQ.option_a}
                  onChange={(e) => setNewQ({ ...newQ, option_a: e.target.value })}
                  className="bg-death-surface border border-death-border rounded p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Option B"
                  required
                  value={newQ.option_b}
                  onChange={(e) => setNewQ({ ...newQ, option_b: e.target.value })}
                  className="bg-death-surface border border-death-border rounded p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Option C"
                  required
                  value={newQ.option_c}
                  onChange={(e) => setNewQ({ ...newQ, option_c: e.target.value })}
                  className="bg-death-surface border border-death-border rounded p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Option D"
                  required
                  value={newQ.option_d}
                  onChange={(e) => setNewQ({ ...newQ, option_d: e.target.value })}
                  className="bg-death-surface border border-death-border rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">CORRECT OPTION</label>
                  <select
                    value={newQ.correct_option}
                    onChange={(e) => setNewQ({ ...newQ, correct_option: e.target.value })}
                    className="w-full bg-death-surface border border-death-border rounded p-2 text-white font-bold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">L'S EYE HINT TEXT</label>
                  <input
                    type="text"
                    value={newQ.hint_text}
                    onChange={(e) => setNewQ({ ...newQ, hint_text: e.target.value })}
                    className="w-full bg-death-surface border border-death-border rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-death-surface text-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-l-cyan text-black font-bold rounded"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
