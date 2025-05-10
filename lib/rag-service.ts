import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from 'fs';
import path from 'path';

// Directory where RAG knowledge documents are stored
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');
const VECTOR_STORE_PATH = path.join(process.cwd(), 'data', 'vectorstore');

// Initialize embeddings with OpenAI - could also use other providers
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create necessary directories if they don't exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    fs.mkdirSync(VECTOR_STORE_PATH, { recursive: true });
  }
}

// Load documents from knowledge directory
async function loadDocuments() {
  ensureDirectoriesExist();
  
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(file => file.endsWith('.txt'));
  const loaders = files.map(file => new TextLoader(path.join(KNOWLEDGE_DIR, file)));
  
  const docs = [];
  for (const loader of loaders) {
    const loadedDocs = await loader.load();
    docs.push(...loadedDocs);
  }
  
  return docs;
}

// Split documents into chunks for better retrieval
async function splitDocuments(docs: any[]) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  return await textSplitter.splitDocuments(docs);
}

// Initialize or load vector store
async function getVectorStore() {
  ensureDirectoriesExist();
  
  try {
    // Try to load existing vector store
    if (fs.existsSync(path.join(VECTOR_STORE_PATH, 'docstore.json'))) {
      return await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
    }
  } catch (error) {
    console.error("Error loading vector store:", error);
    // If loading fails, we'll create a new one
  }
  
  // Create new vector store
  const docs = await loadDocuments();
  const splitDocs = await splitDocuments(docs);
  
  if (splitDocs.length === 0) {
    throw new Error("No documents found to create vector store");
  }
  
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  await vectorStore.save(VECTOR_STORE_PATH);
  
  return vectorStore;
}

// Query the vector store for relevant context
export async function queryKnowledgeBase(query: string, maxResults: number = 5) {
  try {
    const vectorStore = await getVectorStore();
    const results = await vectorStore.similaritySearch(query, maxResults);
    
    return results.map(doc => ({
      content: doc.pageContent,
      source: doc.metadata.source,
    }));
  } catch (error) {
    console.error("Error querying knowledge base:", error);
    return [];
  }
}

// Add new content to the knowledge base
export async function addToKnowledgeBase(content: string, filename: string) {
  ensureDirectoriesExist();
  
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  fs.writeFileSync(filePath, content);
  
  // Reload and update vector store
  const docs = await loadDocuments();
  const splitDocs = await splitDocuments(docs);
  
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  await vectorStore.save(VECTOR_STORE_PATH);
  
  return { success: true, message: "Content added to knowledge base" };
}

// Helper function to generate a system prompt that incorporates retrieved context
export function generateContextEnrichedPrompt(contextDocs: any[], userQuery: string) {
  const contextText = contextDocs.map(doc => doc.content).join('\n\n');
  
  return `You are Ronny, Ron AI's assistant.

REFERENCE INFO:
- Website: https://www.hi-ron.com
- Support: support@hi-ron.com

GUIDELINES:
- Be concise and direct
- Cite sources as [Source: Document Title]
- For missing information, direct users to the website or support
- Avoid making up information not in the provided context

CONTEXT INFORMATION:
${contextText}

Answer the following query based only on the information above:

USER QUERY: ${userQuery}`;
}