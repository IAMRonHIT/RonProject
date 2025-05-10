// Server-side test to verify RAG integration
// This test simulates what happens inside route.ts
// Run with: node scripts/test-rag-server.js

// Import the function directly to test
const { queryKnowledgeBase, generateContextEnrichedPrompt } = require('../lib/rag-service');

async function testRagServerSide() {
  console.log('Testing direct RAG functionality...');

  // Test query that should match our knowledge base
  const testQuery = "What healthcare sectors does Ron AI serve?";
  console.log(`Testing query: "${testQuery}"`);
  
  try {
    // Query the knowledge base directly
    console.log('Querying knowledge base...');
    const relevantDocs = await queryKnowledgeBase(testQuery, 3);
    
    console.log(`\nFound ${relevantDocs.length} relevant documents:`);
    relevantDocs.forEach((doc, i) => {
      console.log(`\n--- DOCUMENT ${i+1} ---`);
      // Show snippet instead of full content
      console.log(doc.content.substring(0, 150) + '...');
    });
    
    // Create the enriched prompt that would be sent to Gemini
    if (relevantDocs.length > 0) {
      const enrichedPrompt = generateContextEnrichedPrompt(relevantDocs, testQuery);
      
      console.log('\n--- ENRICHED PROMPT THAT WOULD BE SENT TO GEMINI ---\n');
      console.log(enrichedPrompt.substring(0, 500) + '...');
      
      console.log('\n--- TESTING RESULTS ---\n');
      console.log('✅ RAG KNOWLEDGE RETRIEVAL: Successfully retrieved relevant documents');
      console.log('✅ PROMPT ENRICHMENT: Created context-enhanced prompt for Gemini');
      console.log('\nThe system is correctly finding and using knowledge to enrich prompts to Gemini.');
    } else {
      console.log('\n--- TESTING RESULTS ---\n');
      console.log('❌ RAG RETRIEVAL FAILED: No relevant documents found');
    }
    
  } catch (error) {
    console.error('Error testing RAG functionality:', error);
  }
}

testRagServerSide();