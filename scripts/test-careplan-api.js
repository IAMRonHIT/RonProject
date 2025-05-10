#!/usr/bin/env node

/**
 * This script tests the connection to the care plan API.
 * It will help diagnose issues with the Perplexity Sonar API integration.
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local or .env file
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

dotenv.config({ path: envFile });

// Configuration
const API_BASE_URL = process.env.CARE_PLAN_API_URL || 'http://localhost:5000';
const SONAR_API_KEY = process.env.SONAR_API_KEY;

// Sample patient data for testing
const samplePatientData = {
  patient_full_name: "John Doe",
  patient_age: "65",
  patient_gender: "Male",
  patient_mrn: "MRN123456",
  // Include minimal data for testing
};

async function testHealthcheck() {
  console.log('\n🔍 Testing API Healthcheck...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/healthcheck`);
    const data = await response.json();
    console.log('✅ Healthcheck successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Healthcheck failed:', error.message);
    console.log('Make sure the Python backend is running by executing: npm run start:careplan');
    return false;
  }
}

async function testSonarAPIKey() {
  console.log('\n🔍 Testing Sonar API Key...');
  if (!SONAR_API_KEY) {
    console.error('❌ No Sonar API key found in environment variables!');
    console.log('Make sure SONAR_API_KEY is set in your .env.local or .env file');
    return false;
  }
  
  console.log(`✅ Sonar API key found: ${SONAR_API_KEY.substring(0, 10)}...`);
  return true;
}

async function testAPIEndpoint() {
  console.log('\n🔍 Testing API endpoint with sample data...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/careplan/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(samplePatientData),
    });
    
    const data = await response.json();
    console.log('✅ API test endpoint successful:');
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ API test endpoint failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Care Plan API Tests');
  console.log('============================');
  console.log(`Using API URL: ${API_BASE_URL}`);
  
  const healthOk = await testHealthcheck();
  const apiKeyOk = await testSonarAPIKey();
  const endpointOk = healthOk && await testAPIEndpoint();
  
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  console.log(`Healthcheck: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Key: ${apiKeyOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test Endpoint: ${endpointOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = healthOk && apiKeyOk && endpointOk;
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n🔧 Troubleshooting Tips:');
    if (!healthOk) {
      console.log('- Make sure the Flask server is running (npm run start:careplan)');
      console.log('- Check if the CARE_PLAN_API_URL in .env.local points to the correct URL');
    }
    if (!apiKeyOk) {
      console.log('- Add your Perplexity API key to .env.local as SONAR_API_KEY');
    }
    if (!endpointOk && healthOk) {
      console.log('- Check the Flask server logs for errors');
      console.log('- Verify that the test endpoint is working properly');
    }
  }
  
  return allPassed;
}

// Run the tests
runTests()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
