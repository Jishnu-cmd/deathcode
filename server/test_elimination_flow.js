// End-to-end verification script for 4 rounds, 10 lives, and elimination
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
  console.log('=== STARTING DEATH NOTE 4-ROUND & 10-LIVES ELIMINATION VERIFICATION ===');
  
  const testRegId = 'TEST_SPK_' + Date.now();
  
  // 1. Register participant
  console.log('\n1. Registering test participant...');
  const regRes = await post('/api/auth/register', {
    reg_id: testRegId,
    team_name: 'Task Force Echo',
    college: 'To-Oh University',
    member_names: 'L Lawliet, Nate River'
  });
  console.log('Registration status:', regRes.status);
  console.log('Participant:', regRes.data.participant.reg_id, 'Lives:', regRes.data.participant.lives, 'Round:', regRes.data.participant.current_round);
  if (regRes.data.participant.lives !== 10) throw new Error('Expected 10 lives on registration!');
  
  // 2. Fetch Round 1 Quiz
  console.log('\n2. Fetching Round 1 questions...');
  const r1Quiz = await get(`/api/quiz/current?reg_id=${testRegId}`, testRegId);
  console.log('Round 1 active round:', r1Quiz.data.round, 'Questions count:', r1Quiz.data.questions?.length);
  if (r1Quiz.data.questions.length !== 10) throw new Error('Expected 10 questions in Round 1!');

  // 3. Test wrong submission in Round 1 (Deduct 1 life)
  console.log('\n3. Submitting intentional wrong answer...');
  const q1 = r1Quiz.data.questions[0];
  const wrongAns = await post('/api/quiz/submit', {
    participant_question_id: q1.participant_question_id,
    selected_option: 'ZZ_INVALID_CHOICE'
  }, testRegId);
  console.log('Submission result:', wrongAns.data);
  if (wrongAns.data.is_correct !== false) throw new Error('Expected answer to be incorrect!');
  if (wrongAns.data.new_lives !== 9) throw new Error('Expected 9 lives after 1 wrong answer!');
  console.log(`Lives decremented correctly: 10 -> ${wrongAns.data.new_lives}`);

  // 4. Advance to Round 2
  console.log('\n4. Advancing to Round 2 (Kira\'s Code)...');
  const advR2 = await post('/api/quiz/advance-round', {}, testRegId);
  console.log('Advance to R2 result:', advR2.data);
  const r2Quiz = await get(`/api/quiz/current?reg_id=${testRegId}`, testRegId);
  console.log('Round 2 active round:', r2Quiz.data.round, 'Questions count:', r2Quiz.data.questions?.length);
  if (r2Quiz.data.questions.length !== 8) throw new Error('Expected 8 questions in Round 2!');

  // 5. Advance to Round 3 (SPK Surveillance & Wiretap)
  console.log('\n5. Advancing to Round 3 (SPK Surveillance & Wiretap)...');
  const advR3 = await post('/api/quiz/advance-round', {}, testRegId);
  console.log('Advance to R3 result:', advR3.data);
  const r3Quiz = await get(`/api/quiz/current?reg_id=${testRegId}`, testRegId);
  console.log('Round 3 active round:', r3Quiz.data.round, 'Questions count:', r3Quiz.data.questions?.length);
  if (r3Quiz.data.questions.length !== 8) throw new Error('Expected 8 questions in Round 3!');

  // 6. Advance to Round 4 (L's Final Investigation)
  console.log('\n6. Advancing to Round 4 (L\'s Final Investigation)...');
  const advR4 = await post('/api/quiz/advance-round', {}, testRegId);
  console.log('Advance to R4 result:', advR4.data);
  const r4Quiz = await get(`/api/quiz/current?reg_id=${testRegId}`, testRegId);
  console.log('Round 4 active round:', r4Quiz.data.round, 'Case title:', r4Quiz.data.caseData?.story_title, 'Clues count:', r4Quiz.data.clues?.length);
  if (r4Quiz.data.clues.length !== 6) throw new Error('Expected 6 clues in Round 4!');

  // 7. Deduct lives until fatal elimination (0 lives)
  console.log('\n7. Testing fatal elimination mechanism (bleeding 9 remaining lives down to 0)...');
  let currentLives = wrongAns.data.new_lives;
  const clue1 = r4Quiz.data.clues[0];

  while (currentLives > 0) {
    const wrongClue = await post('/api/quiz/investigate/submit-clue', {
      clue_id: clue1.id,
      selected_option: 'WRONG_ANSWER'
    }, testRegId);
    currentLives = wrongClue.data.new_lives;
    console.log(`Clue failed! Lives remaining: ${currentLives}, Eliminated: ${wrongClue.data.is_eliminated}`);
  }

  // 8. Verify participant cannot submit once dead
  console.log('\n8. Verifying 403 response when deceased investigator attempts action...');
  const deadAttempt = await post('/api/quiz/investigate/submit-clue', {
    clue_id: clue1.id,
    selected_option: 'B'
  }, testRegId);
  console.log('Dead investigator attempt status:', deadAttempt.status, deadAttempt.data);
  if (deadAttempt.status !== 403) throw new Error('Expected 403 Forbidden for deceased participant!');

  // 9. Verify Leaderboard
  console.log('\n9. Checking Leaderboard status for deceased participant...');
  const lb = await get('/api/leaderboard');
  const testInLb = lb.data.leaderboard.find(t => t.reg_id === testRegId);
  console.log('Leaderboard entry:', testInLb);
  if (!testInLb.status.includes('DECEASED')) throw new Error('Leaderboard should mark participant as DECEASED!');
  if (testInLb.lives !== 0) throw new Error('Leaderboard should display 0 lives!');
  if (testInLb.is_eliminated !== 1) throw new Error('Leaderboard should have is_eliminated = 1!');

  console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 4-ROUND & 10-LIVES ELIMINATION ARCHITECTURE IS COMPLETE!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
