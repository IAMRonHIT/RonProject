// Simple script to test RAG integration with the chatbot
// Run with: node scripts/test-rag-chatbot.js

async function testRagChatbot() {
  console.log('Testing RAG integration with Gemini chatbot...');

  // Test query that should trigger RAG context retrieval
  const testQuery = "What healthcare sectors does Ron AI serve?";
  
  console.log(`Sending test query: "${testQuery}"`);
  
  try {
    // Make a request to the local chat API
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testQuery,
        history: [
          { sender: 'bot', text: "Hi there! I'm Ron AI's assistant. How can I help you today?" }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n--- CHATBOT RESPONSE ---\n');
    console.log(data.reply);
    
    // Check if the response mentions multiple healthcare sectors 
    // which would indicate RAG is working, as this info is in our knowledge base
    const mentions = ['hospital', 'health plan', 'medical practice', 'home care', 'therapy', 'telehealth']
      .filter(term => data.reply.toLowerCase().includes(term));
    
    console.log('\n--- TEST RESULTS ---\n');
    
    if (mentions.length >= 3) {
      console.log('✅ RAG INTEGRATION SUCCESS: Response includes specific knowledge base content');
      console.log(`Found mentions of: ${mentions.join(', ')}`);
    } else {
      console.log('❌ RAG INTEGRATION UNCLEAR: Response may not be using knowledge base');
      console.log('Check server logs to confirm if queryKnowledgeBase was called');
    }
    
  } catch (error) {
    console.error('Error testing chatbot:', error);
  }
}

testRagChatbot();