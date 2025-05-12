#!/usr/bin/env node

/**
 * Script to start the Care Plan Generator feature (both frontend and Python backend)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
require('dotenv').config(); // Load environment variables from .env file

// Kill any existing processes first
console.log(chalk.blue('🧹 Cleaning up any existing processes...'));
require('./kill-servers.sh');

// Get API key from environment variables
const SONAR_API_KEY = process.env.SONAR_API_KEY;
const CARE_PLAN_SERVER_PORT = '5001';

// Check if the API key exists
if (!SONAR_API_KEY) {
  console.error(chalk.red('Error: SONAR_API_KEY not found in environment variables.'));
  console.error(chalk.yellow('Please make sure your .env file contains the SONAR_API_KEY variable.'));
  process.exit(1);
}

// Start the Python backend
console.log(chalk.blue('🚀 Starting Care Plan Python backend with site environment...'));
const pythonBackendPath = path.join(__dirname, '..', 'backend', 'careplan');
const pythonBackend = spawn(path.join(__dirname, '..', 'site', 'bin', 'python'), ['app.py'], {
  cwd: pythonBackendPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    SONAR_API_KEY,
    CARE_PLAN_SERVER_PORT,
    FLASK_DEBUG: '1'
  }
});

// Start the Next.js frontend
console.log(chalk.blue('🚀 Starting Next.js frontend...'));
const nextjsProcess = spawn('npm', ['run', 'dev:next'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    CARE_PLAN_API_URL: `http://localhost:${CARE_PLAN_SERVER_PORT}`
  }
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down services...'));
  pythonBackend.kill();
  nextjsProcess.kill();
  process.exit(0);
});

pythonBackend.on('close', (code) => {
  console.log(chalk.red(`Python backend exited with code ${code}`));
  process.exit(code);
});

nextjsProcess.on('close', (code) => {
  console.log(chalk.red(`Next.js frontend exited with code ${code}`));
  process.exit(code);
});

console.log(chalk.green('✅ All services started!'));
console.log(chalk.cyan(`📋 Care Plan Generator available at: http://localhost:3000/care-plan-generator`));
console.log(chalk.yellow('⌨️  Press Ctrl+C to stop all services'));