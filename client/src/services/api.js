const API_BASE = '/api';

export async function apiRequest(endpoint, method = 'GET', data = null, regId = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (regId) {
    headers['x-registration-id'] = regId;
  }

  const options = {
    method,
    headers
  };
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Server request failed');
  }
  return json;
}

// Authentication
export const registerParticipant = (data) => apiRequest('/auth/register', 'POST', data);
export const getMyProfile = (regId) => apiRequest('/auth/me', 'GET', null, regId);
export const resetEvent = () => apiRequest('/event/reset', 'POST');

// Quiz & Investigation
export const getCurrentQuiz = (regId) => apiRequest('/quiz/current', 'GET', null, regId);
export const advanceRound = (regId) => apiRequest('/quiz/advance-round', 'POST', {}, regId);
export const submitMcqAnswer = (regId, participant_question_id, selected_option, selected_keywords = null) =>
  apiRequest('/quiz/submit', 'POST', { participant_question_id, selected_option, selected_keywords }, regId);
export const askLHint = (regId, question_id) =>
  apiRequest('/quiz/hint', 'POST', { question_id }, regId);
export const activateRyukDeal = (regId) =>
  apiRequest('/quiz/powerup/ryuk', 'POST', {}, regId);
export const executeSqlQuery = (regId, sql) =>
  apiRequest('/quiz/investigate/query', 'POST', { sql }, regId);
export const submitClueAnswer = (regId, clue_id, selected_option) =>
  apiRequest('/quiz/investigate/submit-clue', 'POST', { clue_id, selected_option }, regId);
export const submitFinalCriminal = (regId, suspect_code, binary_code) =>
  apiRequest('/quiz/investigate/submit-criminal', 'POST', { suspect_code, binary_code }, regId);

// Telemetry & Anti-Cheat
export const logTabSwitch = (regId) =>
  apiRequest('/telemetry/tab-switch', 'POST', {}, regId);

// Leaderboard
export const fetchLeaderboard = (isAdmin = false) =>
  apiRequest(`/leaderboard?admin=${isAdmin}`);

// Admin APIs
export const fetchAdminOverview = () => apiRequest('/admin/overview');
export const updateEventStatus = (status, is_paused) =>
  apiRequest('/admin/event/status', 'POST', { status, is_paused });
export const updateEventTimer = (minutes) =>
  apiRequest('/admin/event/timer', 'POST', { minutes });
export const updateEventToggles = (toggles) =>
  apiRequest('/admin/event/toggles', 'POST', toggles);
export const fetchAdminQuestions = (round_id, category) => {
  let q = '';
  if (round_id) q += `round_id=${round_id}&`;
  if (category) q += `category=${category}`;
  return apiRequest(`/admin/questions?${q}`);
};
export const addAdminQuestion = (question) =>
  apiRequest('/admin/questions', 'POST', question);
export const deleteAdminQuestion = (id) =>
  apiRequest(`/admin/questions/${id}`, 'DELETE');
