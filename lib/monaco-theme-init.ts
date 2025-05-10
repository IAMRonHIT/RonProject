// Purpose: Define the custom Monaco Editor theme "glass-teal"
// This file defines the Monaco Editor theme globally so it's available
// as soon as any Monaco Editor component is mounted

import { editor as MonacoEditor } from 'monaco-editor';

/**
 * Defines a modern "glass-teal" theme with multi-color syntax highlighting for FHIR JSON.
 * This should be called via onMount handler, passing the monaco instance.
 * @param monaco The Monaco Editor API object (specifically monaco.editor)
 */
export function initializeMonacoTheme(monaco: typeof MonacoEditor): void {
  monaco.defineTheme("glass-teal", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Multi-color syntax highlighting for FHIR JSON
      { token: '', foreground: '32FF89' },  // Default text (green)
      { token: 'string', foreground: 'FF00FF' },  // JSON strings (pink)
      { token: 'string.key', foreground: '00FFFF' },  // JSON property names (teal)
      { token: 'string.value', foreground: 'FF00FF' },  // JSON string values (pink)
      { token: 'number', foreground: 'BC8CFF' },  // JSON numbers (purple)
      { token: 'keyword', foreground: 'BC8CFF' },  // true, false, null (purple)
      { token: 'delimiter', foreground: '32FF89' },  // brackets, braces, commas (green)
      { token: 'delimiter.bracket', foreground: '32FF89' },  // brackets (green)
      { token: 'delimiter.array', foreground: '32FF89' },  // array brackets (green)
      { token: 'delimiter.parenthesis', foreground: '32FF89' },  // parentheses (green)
      { token: 'delimiter.curly', foreground: '32FF89' },  // braces (green)
      // Special handling for FHIR-specific tokens
      { token: 'string.key.json', foreground: '00FFFF' },  // JSON property names (teal)
      { token: 'string.value.json', foreground: 'FF00FF' },  // JSON string values (pink)
    ],
    colors: {
      "editor.background": "#111827", // Tailwind bg-gray-900 solid, no alpha to avoid errors
      "editor.foreground": "#32FF89",   // Ron AI Green
      "editor.lineHighlightBackground": "#1F2937", // Tailwind gray-800 for subtle highlight
      "editorGutter.background": "#111827", // Same as editor background
      "editorCursor.foreground": "#32FF89", // Ron AI Green cursor
    },
  });

  console.log("Full-color 'glass-teal' theme defined with green, teal, purple, and pink."); // Log definition
}
