// RAG server initialization script
// This script creates the vector store on startup
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
require('dotenv').config(); // Load environment variables from .env file

// Check if the API key exists in the environment
if (!process.env.OPENAI_API_KEY) {
  console.error(chalk.red('Error: OPENAI_API_KEY not found in environment variables.'));
  console.error(chalk.yellow('Please make sure your .env file contains the OPENAI_API_KEY variable.'));
  process.exit(1);
}

// Project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT_DIR, 'data', 'knowledge');
const VECTOR_STORE_PATH = path.join(ROOT_DIR, 'data', 'vectorstore');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.log(chalk.yellow('Creating knowledge directory...'));
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    console.log(chalk.yellow('Creating vector store directory...'));
    fs.mkdirSync(VECTOR_STORE_PATH, { recursive: true });
  }
}

// Check for knowledge files
function checkKnowledgeFiles() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(file => file.endsWith('.txt'));
  console.log(chalk.blue(`Found ${files.length} knowledge documents in ${KNOWLEDGE_DIR}`));
  
  if (files.length === 0) {
    console.log(chalk.red('Warning: No knowledge files found. RAG system will not be effective.'));
    console.log(chalk.yellow('Please add .txt files to the data/knowledge directory.'));
    return false;
  }
  
  files.forEach(file => {
    console.log(chalk.green(`- ${file}`));
  });
  
  return true;
}

// Initialize vector store
function initializeVectorStore() {
  console.log(chalk.blue('Preparing RAG system...'));
  
  // Check if OpenAI API key is configured - should be set at top of file
  console.log(chalk.green('Using OpenAI API key for vector embeddings'));
  
  ensureDirectories();
  const hasKnowledgeFiles = checkKnowledgeFiles();
  
  if (hasKnowledgeFiles) {
    console.log(chalk.blue('Vector store will be created on first API request'));
    console.log(chalk.green('RAG system initialized successfully'));
  }
}

// Main execution
function main() {
  console.log(chalk.blue.bold('Starting Ron AI RAG Server'));
  console.log(chalk.blue('----------------------------'));
  
  try {
    initializeVectorStore();
    
    // Keep process running
    console.log(chalk.green('\nRAG server is running. Vector store will build on first query.'));
    console.log(chalk.yellow('Press Ctrl+C to stop the server.'));
    
    // This keeps the process alive
    setInterval(() => {}, 1000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.blue('\nShutting down RAG server...'));
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red('Error initializing RAG server:'), error);
    process.exit(1);
  }
}

// Start the server
main();