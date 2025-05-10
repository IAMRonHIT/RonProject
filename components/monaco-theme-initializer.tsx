"use client";

import { useEffect } from 'react';
import { initializeMonacoTheme } from '@/lib/monaco-theme-init';
import { editor } from 'monaco-editor';

/**
 * Component that initializes Monaco Editor themes.
 * This should be included once at a high level in your app,
 * such as in the RootLayout or in a theme provider component.
 * 
 * It doesn't render any visible UI, it just initializes the themes.
 */
export function MonacoThemeInitializer() {
  useEffect(() => {
    // Monaco editor might not be available on the server side
    if (typeof window !== 'undefined') {
      // Initialize the custom theme if monaco is available
      if (window.monaco && window.monaco.editor) {
        initializeMonacoTheme(window.monaco.editor);
      } else {
        // If monaco is not yet available, we can wait for it
        const checkMonaco = setInterval(() => {
          if (window.monaco && window.monaco.editor) {
            initializeMonacoTheme(window.monaco.editor);
            clearInterval(checkMonaco);
          }
        }, 100);
        
        // Clean up interval if component unmounts
        return () => clearInterval(checkMonaco);
      }
    }
  }, []);
  
  // This component doesn't render anything visible
  return null;
}

// Add this to global.d.ts or similar file to make TypeScript happy
declare global {
  interface Window {
    monaco: {
      editor: typeof editor;
      [key: string]: any;
    };
  }
}
