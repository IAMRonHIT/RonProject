"use client"

import React from "react"
import { Editor } from "@monaco-editor/react"
import { applyNeonTheme } from "./neonTheme"

interface MonacoEditorPanelProps {
  content: string
  language?: string
  readOnly?: boolean
  height?: string
  onChange?: (value: string | undefined) => void
}

export function MonacoEditorPanel({
  content,
  language = "json",
  readOnly = true,
  height = "400px",
  onChange
}: MonacoEditorPanelProps) {
  return (
    <div className="relative">
      {/* Optional loading overlay with electric teal effect */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="w-6 h-6 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin opacity-0 editor-loading"></div>
      </div>
      
      <Editor
        height={height}
        language={language}
        value={content}
        onChange={onChange}
        className="monaco-neon-editor" // Add a class for potential global styling
        options={{
          readOnly,
          minimap: { 
            enabled: true,
            renderCharacters: false, // Cleaner minimap
            maxColumn: 60,
            scale: 1,
          },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "JetBrains Mono, monospace",
          wordWrap: "on",
          theme: "glass-teal", // Will apply our custom theme
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: 8, // Thinner scrollbars
            horizontalScrollbarSize: 8,
            useShadows: false, // Cleaner look
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'visible',
            horizontal: 'visible',
          },
          padding: {
            top: 16,
            bottom: 16,
          },
          renderLineHighlight: "all",
          cursorStyle: readOnly ? "line-thin" : "line",
          cursorBlinking: readOnly ? "solid" : "phase",
          cursorSmoothCaretAnimation: "on", // Smooth cursor animation
          smoothScrolling: true, // Smooth scrolling
          renderWhitespace: "none", // Hide whitespace characters
          guides: { indentation: false }, // Hide indent guides for cleaner look
          colorDecorators: true, // Enable color decorators
        }}
        beforeMount={(monaco) => {
          // Define a custom theme with electric teal accents
          monaco.editor.defineTheme("glass-teal", {
            base: "vs-dark",
            inherit: true,
            rules: [
              // Make everything electric teal focused
              { token: "string", foreground: "#00FFFF" },  // Electric teal for strings
              { token: "number", foreground: "#00FFFF" },  // Electric teal for numbers
              { token: "keyword", foreground: "#00FFFF" }, // Electric teal for keywords
              { token: "delimiter", foreground: "#00FFFF" }, // Electric teal for delimiters
              { token: "comment", foreground: "#00FFFF66" },  // Translucent electric teal for comments
              
              // JSON specific tokens - all electric teal for a more cohesive neon look
              { token: "string.key.json", foreground: "#00FFFF" }, // Electric teal for JSON keys
              { token: "string.value.json", foreground: "#00FFFF" }, // Electric teal for JSON values
            ],
            colors: {
              // Monaco doesn't support true transparency, but we'll set a dark color
              // that will work well with our container's glassmorphism
              "editor.background": "#111827", // Dark background (will be overridden with CSS)
              "editor.foreground": "#00FFFF",   // Electric teal text
              
              // Bright electric teal cursor
              "editorCursor.foreground": "#00FFFF",
              
              // Translucent electric teal for line highlight
              "editor.lineHighlightBackground": "#00FFFF22",
              
              // Line numbers in electric teal
              "editorLineNumber.foreground": "#00FFFF99",
              "editorLineNumber.activeForeground": "#00FFFF",
              
              // Selection in electric teal
              "editor.selectionBackground": "#00FFFF33",
              
              // Widget styling
              "editorSuggestWidget.background": "#111827",
              "editorSuggestWidget.border": "#00FFFF33",
              "editorSuggestWidget.selectedBackground": "#00FFFF22",
              "editorWidget.background": "#111827",
              "editorWidget.border": "#00FFFF33",
              
              // Scrollbar in electric teal
              "scrollbarSlider.background": "#00FFFF33",
              "scrollbarSlider.hoverBackground": "#00FFFF44",
              "scrollbarSlider.activeBackground": "#00FFFF66",
            },
          });
          monaco.editor.setTheme("glass-teal");
          
          // Add global CSS for additional styling including glassmorphism effects
          const style = document.createElement('style');
          style.innerHTML = `
            /* Force Monaco's background to be transparent */
            .monaco-editor, .monaco-editor-background, .monaco-editor .margin {
              background-color: transparent !important;
            }
            
            /* Enhanced cursor glow effect */
            .monaco-editor .cursor {
              box-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF !important;
              transition: all 0.1s ease-in-out;
            }
            
            /* Text glow effect */
            .monaco-editor .view-line {
              text-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
            }
            
            /* Loading animation */
            .editor-loading {
              animation: fadeInOut 2s infinite;
            }
            @keyframes fadeInOut {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          `;
          document.head.appendChild(style);
        }}
      />
    </div>
  )
}
