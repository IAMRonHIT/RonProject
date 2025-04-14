'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { Play, Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import 'monaco-editor/min/vs/editor/editor.main.css';

// Define a simple dark theme inline (since ide-theme.ts was deleted)
const darkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a9955' },
    { token: 'keyword', foreground: '569cd6' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'operator', foreground: 'd4d4d4' },
    { token: 'identifier', foreground: '9cdcfe' },
    { token: 'type', foreground: '4ec9b0' },
    { token: 'function', foreground: 'dcdcaa' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editorCursor.foreground': '#AEAFAD',
    'editor.lineHighlightBackground': '#3c3c3c50',
    'editorLineNumber.foreground': '#858585',
    'editor.selectionBackground': '#264f78',
    'editorSuggestWidget.background': '#252526',
    'editorSuggestWidget.border': '#454545',
    'input.background': '#3C3C3C',
    'input.border': '#3C3C3C',
    'scrollbarSlider.background': '#4e4e4e90',
    'scrollbarSlider.hoverBackground': '#5f5f5f90',
    'scrollbarSlider.activeBackground': '#7a7a7a90',
  }
};

interface StreamlitEditorPanelProps {
  className?: string;
  initialCode: string;
  backendUrl: string; // URL of the Flask backend
  onRunComplete: (success: boolean) => void; // Callback after run attempt
}

const StreamlitEditorPanel: React.FC<StreamlitEditorPanelProps> = ({
  className,
  initialCode,
  backendUrl,
  onRunComplete
}) => {
  const monaco = useMonaco();
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('darkTheme', darkTheme as any);
      monaco.editor.setTheme('darkTheme');
    }
  }, [monaco]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value ?? '';
    setCode(newCode);
    if (newCode !== initialCode) {
        setIsDirty(true);
    }
  };

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setStatusMessage("Updating code and restarting Streamlit...");
    setIsError(false);

    try {
      const response = await fetch(`${backendUrl}/update_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setStatusMessage("Streamlit updated and running!");
        setIsError(false);
        setIsDirty(false); // Code is now saved and running
        onRunComplete(true);
      } else {
        throw new Error(result.message || 'Failed to update code or start Streamlit');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error running code:", message);
      setStatusMessage(`Error: ${message}`);
      setIsError(true);
      onRunComplete(false);
    } finally {
      setIsRunning(false);
      // Clear status message after a delay
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, [code, backendUrl, onRunComplete, initialCode]);

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden border border-[#30363D]/60 rounded-md bg-[#1E1E1E]",
      className
    )}>
      {/* Header with Run Button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363D] bg-[#252526]">
        <h3 className="text-sm font-semibold text-gray-300">user_app.py</h3>
        <div className="flex items-center space-x-2">
            {isDirty && <span className="text-xs text-yellow-400 italic">Unsaved changes</span>}
            {statusMessage && (
                <div className={cn(
                    "text-xs flex items-center",
                    isError ? "text-red-400" : "text-green-400"
                )}>
                {isError ? <AlertTriangle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                {statusMessage}
                </div>
            )}
             <button
                className={cn(
                "px-3 py-1 rounded-md flex items-center text-sm transition-colors",
                "bg-green-600 hover:bg-green-700 text-white",
                "disabled:bg-gray-500 disabled:cursor-not-allowed"
                )}
                onClick={handleRunCode}
                disabled={isRunning}
            >
                {isRunning ? (
                    <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Running...
                    </>
                    ) : (
                    <>
                        <Play className="h-4 w-4 mr-1" />
                        Run
                    </>
                )}
             </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-grow relative">
        <Editor
          height="100%" // Use 100% of parent height
          language="python"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            automaticLayout: true, // Important for resizing
            wordWrap: 'on',
            renderWhitespace: 'boundary',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            padding: { top: 10 },
            mouseWheelZoom: true,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};

export default StreamlitEditorPanel; 