"use client"

import React from "react"

// This is the JavaScript configuration object for monaco.editor.defineTheme
// It defines a custom glassmorphic theme named 'glass-teal'
export const glassTealTheme = {
  base: "vs-dark", // Base theme to extend
  inherit: true,   // Inherit rules from base theme
  
  // Syntax token rules - all electric teal for a cohesive neon look
  rules: [
    // Make everything electric teal focused for a true neon aesthetic
    { token: "string", foreground: "#00FFFF" },  // Electric teal for strings
    { token: "number", foreground: "#00FFFF" },  // Electric teal for numbers
    { token: "keyword", foreground: "#00FFFF" }, // Electric teal for keywords
    { token: "delimiter", foreground: "#00FFFF" }, // Electric teal for delimiters
    { token: "comment", foreground: "#00FFFF66" },  // Translucent electric teal for comments
    
    // JSON specific tokens - all electric teal for a more cohesive neon look
    { token: "string.key.json", foreground: "#00FFFF" }, // Electric teal for JSON keys
    { token: "string.value.json", foreground: "#00FFFF" }, // Electric teal for JSON values
    
    // Additional syntax tokens
    { token: "identifier", foreground: "#00FFFF" }, // Electric teal for identifiers
    { token: "type", foreground: "#00FFFF" },       // Electric teal for types
  ],
  
  // Editor colors
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
  }
};

/**
 * Example of how to apply the glass-teal theme to a Monaco editor instance
 * with glassmorphism effects
 * 
 * Usage:
 * 
 * import { Editor } from "@monaco-editor/react";
 * 
 * <div className="glassmorphic-editor-container">
 *   <Editor
 *     beforeMount={(monaco) => {
 *       applyGlassTealTheme(monaco);
 *     }}
 *     // Other editor props...
 *   />
 * </div>
 */

export function applyGlassTealTheme(monaco: any) {
  // Define the theme
  monaco.editor.defineTheme("glass-teal", glassTealTheme);
  // Apply the theme
  monaco.editor.setTheme("glass-teal");
  
  // Add global CSS for glassmorphism effects
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
    
    /* Glassmorphic container styling */
    .glassmorphic-editor-container {
      position: relative;
      background: rgba(0, 128, 128, 0.15);
      box-shadow: 0 4px 32px 0 rgba(0, 255, 255, 0.6);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(0, 255, 255, 0.4);
    }
  `;
  document.head.appendChild(style);
}

// For backward compatibility
export const applyNeonTheme = applyGlassTealTheme;
export const neonIDETheme = glassTealTheme;
