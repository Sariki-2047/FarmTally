const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FarmTally Development Server...\n');

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

devProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
});

devProcess.on('close', (code) => {
  console.log(`\n📴 Development server stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  devProcess.kill('SIGTERM');
  process.exit(0);
});