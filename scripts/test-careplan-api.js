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
const API_BASE_URL = process.env.CARE_PLAN_API_URL || 'http://localhost:5001'; // Default to 5001
const SONAR_API_KEY = process.env.SONAR_API_KEY;

// Sample patient data for testing
// More realistic sample patient data for testing streaming
const samplePatientData = {
  patient_full_name: "Mary Johnson",
  patient_age: "72",
  patient_gender: "Female",
  patient_mrn: "MRN987654",
  patient_dob: "1952-03-15",
  patient_insurance_plan: "Medicare Advantage",
  patient_policy_number: "MED123456789",
  patient_primary_provider: "Dr. Evelyn Reed",
  patient_admission_date: new Date().toISOString().split('T')[0],
  allergies: ["Aspirin (Hives)"],
  vitalSigns: {
    vital_bp: "145/88 mmHg",
    vital_pulse: "82 bpm",
    vital_resp_rate: "20/min",
    vital_temp: "37.1°C",
    vital_o2sat: "94%",
    vital_pain_score: "3/10"
  },
  primary_diagnosis_text: "Chronic Obstructive Pulmonary Disease (COPD), exacerbation",
  secondaryDiagnoses: ["Hypertension", "Osteoarthritis"],
  labs: [
    { lab_n_name: "ABG pH", lab_n_value: "7.32", lab_n_flag: "LOW", lab_n_trend: "stable" },
    { lab_n_name: "ABG PaCO2", lab_n_value: "55 mmHg", lab_n_flag: "HIGH", lab_n_trend: "increasing" }
  ],
  medications: [
    { med_n_name: "Albuterol Inhaler", med_n_dosage: "2 puffs", med_n_route: "Inhaled", med_n_frequency: "Q4H PRN", med_n_status: "Active" },
    { med_n_name: "Prednisone", med_n_dosage: "40mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "New Order" }
  ],
  treatments: [
    { treatment_n_name: "Supplemental O2", treatment_n_status: "In Progress", treatment_n_details: "2L via Nasal Cannula" }
  ]
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

async function testStreamingEndpoint() {
  console.log('\n🔍 Testing Streaming Endpoint...');
  let streamId = null;
  try {
    // 1. Initiate Stream
    console.log('   Initiating stream...');
    const initiateResponse = await fetch(`${API_BASE_URL}/api/careplan/initiate-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(samplePatientData),
      timeout: 10000 // 10 seconds timeout
    });

    if (!initiateResponse.ok) {
      const errorText = await initiateResponse.text();
      throw new Error(`Stream initiation failed: ${initiateResponse.status} - ${errorText}`);
    }

    const initiateData = await initiateResponse.json();
    streamId = initiateData.stream_id;
    if (!streamId) {
      throw new Error('No stream_id received from /initiate-stream');
    }
    console.log(`   Stream initiated successfully. Stream ID: ${streamId}`);

    // 2. Connect to Stream (using simple fetch for demonstration, might not capture all chunks perfectly in complex cases)
    console.log('   Connecting to stream endpoint...');
    const streamResponse = await fetch(`${API_BASE_URL}/api/careplan/stream?streamId=${streamId}`, {
        timeout: 90000 // 90 seconds timeout for generation
    });

    if (!streamResponse.ok) {
       throw new Error(`Connecting to stream failed: ${streamResponse.status}`);
    }

    console.log('   Stream connected. Waiting for data...');
    
    // Use Node.js stream events to capture the raw output within the try block
    return new Promise((resolve, reject) => {
        let rawOutput = ''; // Accumulate raw output

        streamResponse.body.on('data', (chunk) => {
            const chunkString = chunk.toString();
            // console.log('--- RAW CHUNK ---'); // Optional: log each raw chunk
            // console.log(chunkString);
            // console.log('-----------------');
            rawOutput += chunkString; 
        });

        streamResponse.body.on('end', () => {
            console.log('   Stream finished.');
            console.log('\n✅✅✅ COMPLETE RAW STREAM OUTPUT: ✅✅✅\n');
            console.log(rawOutput); // Log the entire raw output
            console.log('\n✅✅✅ END OF RAW STREAM OUTPUT ✅✅✅\n');
            resolve(true); // Mark test as successful for completing the stream
        });

        streamResponse.body.on('error', (err) => {
            console.error('❌ Stream connection error:', err);
            reject(err); // Reject the promise on stream error
        });
    }); // End of Promise constructor

  } catch (error) { // Catch errors from fetch or promise rejection
    console.error('❌ Streaming endpoint test failed:', error.message);
    if (error.stack) {
        console.error(error.stack);
    }
    return false; // Indicate test failure
  }
} // End of testStreamingEndpoint function


async function runTests() {
  console.log('🚀 Starting Care Plan API Tests');
  console.log('================================');
  console.log(`Using API URL: ${API_BASE_URL}`);

  const healthOk = await testHealthcheck();
  const apiKeyOk = await testSonarAPIKey();
  // const endpointOk = healthOk && await testAPIEndpoint(); // Keep basic test optional or remove
  const streamingOk = healthOk && apiKeyOk && await testStreamingEndpoint(); // Add streaming test

  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  console.log(`Healthcheck:     ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Key Found:   ${apiKeyOk ? '✅ PASS' : '❌ FAIL'}`);
  // console.log(`Test Endpoint:   ${endpointOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Streaming Test:  ${streamingOk ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = healthOk && apiKeyOk && streamingOk; // Use streamingOk instead of endpointOk
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
    // Removed reference to endpointOk as it's not being tested in the main flow now
    if (!streamingOk && healthOk && apiKeyOk) {
       console.log('- Check the Flask server logs for errors during streaming');
       console.log('- Verify the /initiate-stream and /stream endpoints in the backend');
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
