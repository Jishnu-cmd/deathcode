const { spawn } = require('child_process');

console.log('================================================================');
console.log('☠️  DEATH CODE: THE KIRA PROTOCOL — LAUNCHING EVENT SYSTEM  ☠️');
console.log('================================================================');
console.log('• Backend & Static App:  http://localhost:5000');
console.log('• Client Dev Server:     http://localhost:3000');
console.log('================================================================\n');

// Start backend
const serverProcess = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (err) => {
  console.error('Server process error:', err);
});

// Start client vite dev server
const clientProcess = spawn('npm.cmd', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

clientProcess.on('error', (err) => {
  console.error('Client dev server process error:', err);
});

process.on('SIGINT', () => {
  try { serverProcess.kill(); } catch (_) {}
  try { clientProcess.kill(); } catch (_) {}
  process.exit();
});

process.on('SIGTERM', () => {
  try { serverProcess.kill(); } catch (_) {}
  try { clientProcess.kill(); } catch (_) {}
  process.exit();
});

