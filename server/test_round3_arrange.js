// Test Round 3 "Arrange Missing Keywords" Verification Script
const http = require('http');

function post(path, body, regId = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (regId) {
      headers['x-registration-id'] = regId;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, regId = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (regId) {
      headers['x-registration-id'] = regId;
    }
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=== STARTING ROUND 3 ARRANGE MISSING KEYWORDS VERIFICATION ===\n');

  const testRegId = 'TEST_R3_ARRANGE_' + Date.now();

  // 1. Register
  console.log('1. Registering test participant...');
  const regRes = await post('/api/auth/register', {
    reg_id: testRegId,
    team_name: 'Near SPK Unit',
    college: 'Wammy House',
    member_names: 'Near, Rester, Lidner'
  });
  console.log('Registered:', regRes.data.participant.reg_id, 'Lives:', regRes.data.participant.lives);

  // 2. Advance to Round 3 directly
  console.log('\n2. Advancing participant directly to Round 3...');
  await post('/api/quiz/advance-round', {}, testRegId); // to Round 2
  await post('/api/quiz/advance-round', {}, testRegId); // to Round 3

  // 3. Fetch Round 3 questions
  console.log('\n3. Fetching Round 3 questions...');
  const r3Data = await get(`/api/quiz/current`, testRegId);
  console.log('Round 3 Active Round:', r3Data.data.round, 'Question count:', r3Data.data.questions?.length);
  if (r3Data.data.questions.length !== 8) throw new Error('Expected 8 questions in Round 3!');

  const q1 = r3Data.data.questions[0];
  console.log('\nInspecting Question 1:');
  console.log('Category:', q1.category, '| Concept:', q1.concept);
  console.log('Question Type:', q1.question_type);
  console.log('Code Snippet with Blanks:\n' + q1.code_snippet);
  console.log('Available Scrambled Keywords:', q1.keywords);

  if (q1.question_type !== 'ARRANGE_KEYWORDS') throw new Error('Expected question_type ARRANGE_KEYWORDS');
  if (!q1.code_snippet.includes('[ 1 ]') || !q1.code_snippet.includes('[ 4 ]')) {
    throw new Error('Expected [ 1 ] and [ 4 ] in code snippet');
  }
  if (!Array.isArray(q1.keywords) || q1.keywords.length !== 4) {
    throw new Error('Expected 4 keywords array in question');
  }

  // 4. Test wrong sequence submission
  console.log('\n4. Submitting intentional wrong keyword sequence...');
  const wrongSeq = [q1.keywords[3], q1.keywords[2], q1.keywords[1], q1.keywords[0]]; // reversed
  const wrongRes = await post('/api/quiz/submit', {
    participant_question_id: q1.participant_question_id,
    selected_keywords: wrongSeq
  }, testRegId);
  console.log('Wrong submission result:', wrongRes.data);
  if (wrongRes.data.is_correct !== false) throw new Error('Expected wrong answer to fail');
  if (wrongRes.data.new_lives !== 9) throw new Error('Expected 9 lives after wrong submission');
  if (!Array.isArray(wrongRes.data.correct_sequence) || wrongRes.data.correct_sequence.length !== 4) {
    throw new Error('Expected correct_sequence array in response');
  }
  console.log('Correct sequence returned by server:', wrongRes.data.correct_sequence);

  // 5. Test correct sequence submission for Question 2
  console.log('\n5. Submitting correct sequence for Question 2...');
  const q2 = r3Data.data.questions[1];
  const { getRound3Questions } = require('./round3_questions');
  const allQ = getRound3Questions();
  const matchedQ = allQ.find(x => x.concept === q2.concept) || allQ[0];
  const correctSeq = [matchedQ.a, matchedQ.b, matchedQ.c, matchedQ.d];
  console.log('Expected correct sequence for Q2:', correctSeq);

  const correctRes = await post('/api/quiz/submit', {
    participant_question_id: q2.participant_question_id,
    selected_keywords: correctSeq
  }, testRegId);
  console.log('Correct submission result:', correctRes.data);
  if (correctRes.data.is_correct !== true) throw new Error('Expected correct sequence to succeed');
  if (correctRes.data.points_awarded !== 4) throw new Error('Expected +4 points awarded');
  if (correctRes.data.new_score !== 4) throw new Error('Expected new score to be 4');
  if (correctRes.data.new_lives !== 9) throw new Error('Expected lives to remain 9');

  console.log('\n✅ ALL ROUND 3 ARRANGE MISSING KEYWORDS TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
