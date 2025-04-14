'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import StreamlitEditorPanel from './monaco/streamlit-editor-panel';
import StreamlitPreviewPanel from './monaco/streamlit-preview-panel';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initial Python code (can be fetched or imported)
const initialPythonCode = `
import streamlit as st
import pandas as pd
import numpy as np
import time
import json
import random
from datetime import datetime, timedelta
import altair as alt
import plotly.graph_objects as go
import plotly.express as px
from streamlit_plotly_events import plotly_events

# Set page configuration
st.set_page_config(
    page_title="Ron AI - Prior Authorization Agent Workflow",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ... (rest of the Streamlit app code from user_app.py) ...

# Example: Add a title
st.title("Streamlit Application Preview")
st.write("This is a simple preview running via the backend.")

# Add a basic chart
data = pd.DataFrame(
    np.random.randn(20, 3),
    columns=['a', 'b', 'c'])

st.line_chart(data)

st.write("Modify the code in the editor and click 'Run' to update.")
`.trim();

// Make sure this points to your running Flask backend
const BACKEND_URL = 'http://localhost:5001'; 
// The Streamlit app runs on a different port managed by the backend
const STREAMLIT_URL = 'http://localhost:8501'; 

export default function StreamlitIde() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'running' | 'stopped' | 'error'>('checking');
  const [refreshPreviewKey, setRefreshPreviewKey] = useState(0); // State to trigger preview refresh

  // Check backend status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/status`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'running') {
          setBackendStatus('running');
          setRefreshPreviewKey(prev => prev + 1); // Initial refresh trigger
        } else {
          setBackendStatus('stopped');
        }
      } catch (error) {
        console.error("Failed to fetch backend status:", error);
        setBackendStatus('error');
      }
    };
    checkStatus();
    // Optional: Set up polling to check status periodically
    // const intervalId = setInterval(checkStatus, 10000); // Check every 10 seconds
    // return () => clearInterval(intervalId);
  }, []);

  // Callback function for when the run command completes in the editor
  const handleRunComplete = (success: boolean) => {
    if (success) {
        // Increment the key to force the iframe to reload its content
        setRefreshPreviewKey(prev => prev + 1);
    }
    // Optionally handle the failure case, maybe show a persistent error
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-[#050818] to-[#10142a] py-16 md:py-24 overflow-hidden text-white">
      {/* Optional: Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 10% 10%, rgba(0, 229, 224, 0.1) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
        }}
      ></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 bg-gradient-to-r from-[#00E5E0] to-[#3b82f6] text-transparent bg-clip-text">
            Interactive Streamlit IDE
          </h2>
          <p className="text-gray-300 text-lg md:text-xl mb-6 max-w-3xl mx-auto">
            Edit the Python code below and click 'Run' to see the Streamlit application update live in the preview panel.
          </p>
          {/* Backend Status Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className={cn(
                "h-3 w-3 rounded-full inline-block",
                backendStatus === 'running' ? 'bg-green-500 animate-pulse' : 
                backendStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            )}></span>
            <span>
              Backend Status: 
              <span className={cn(
                  "font-semibold",
                  backendStatus === 'running' ? 'text-green-400' : 
                  backendStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
              )}>
                 {backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1)}
              </span>
            </span>
          </div>
           {backendStatus === 'error' && (
            <div className="mt-3 text-red-400 bg-red-900/30 border border-red-400/50 rounded-md p-3 max-w-md mx-auto flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>Could not connect to the backend at <code>{BACKEND_URL}</code>. Please ensure it's running.</span>
            </div>
          )}
           {backendStatus === 'stopped' && (
            <div className="mt-3 text-yellow-400 bg-yellow-900/30 border border-yellow-400/50 rounded-md p-3 max-w-md mx-auto flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>The backend server appears to be stopped. Start it to enable the IDE.</span>
            </div>
          )}
        </div>

        {/* IDE Layout - Only render if backend is not in error state */}
        {backendStatus !== 'error' ? (
            <motion.div
                className="w-full h-[750px] bg-[#161B22]/80 backdrop-blur-md border border-[#30363D]/60 rounded-lg shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                {/* Enhanced glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-xl -z-10 opacity-70"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur-2xl -z-20 opacity-50"></div>

                {/* Window Header Simulation */}
                <div className="flex items-center px-4 py-2 bg-[#0d1117]/90 border-b border-[#30363D]">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="ml-4 text-sm text-gray-400">
                        Ron AI Streamlit Editor
                    </div>
                </div>

                {/* Resizable Panel Group */}
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-[calc(750px-36px)]" // Adjust height for header
                >
                    {/* Editor Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <StreamlitEditorPanel 
                            className="h-full border-0 rounded-none" 
                            initialCode={initialPythonCode} 
                            backendUrl={BACKEND_URL}
                            onRunComplete={handleRunComplete}
                        />
                    </ResizablePanel>
                    
                    <ResizableHandle withHandle className="bg-[#30363D] w-2 hover:bg-[#00E5E0]/50 transition-colors" />
                    
                    {/* Preview Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                         <StreamlitPreviewPanel 
                             className="h-full border-0 rounded-none" 
                             streamlitUrl={STREAMLIT_URL}
                             refreshKey={refreshPreviewKey} // Pass the key
                         />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </motion.div>
         ) : (
             <div className="text-center text-gray-400 py-10">
                 IDE cannot be displayed because the backend is unavailable.
             </div>
         )}
      </div>
    </section>
  );
} 