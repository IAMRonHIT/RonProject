'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface StreamlitPreviewPanelProps {
  className?: string;
  streamlitUrl: string; // URL of the running Streamlit app
  refreshKey: number; // Key to force iframe refresh
}

const StreamlitPreviewPanel: React.FC<StreamlitPreviewPanelProps> = ({
  className,
  streamlitUrl,
  refreshKey
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);

  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      // Change the src slightly to force a reload, appending a timestamp
      setIframeSrc(`${streamlitUrl}?_t=${Date.now()}`);
    }
  };

  // Update iframe source when streamlitUrl changes or refreshKey increments
  useEffect(() => {
    setIsLoading(true);
    setIframeSrc(`${streamlitUrl}?_t=${refreshKey}`); // Use refreshKey to ensure reload
  }, [streamlitUrl, refreshKey]);

  const handleLoad = () => {
    setIsLoading(false);
    console.log("Streamlit iframe loaded successfully.");
  };

  const handleError = () => {
     setIsLoading(false);
     console.error("Streamlit iframe failed to load.");
     // Optionally show an error message to the user in the iframe area
     if (iframeRef.current?.contentDocument) {
        iframeRef.current.contentDocument.body.innerHTML = 
          `<div style="padding: 20px; font-family: sans-serif; color: #dc3545;">
             <h2>Error Loading Preview</h2>
             <p>Could not connect to the Streamlit application at:</p>
             <p><code>${streamlitUrl}</code></p>
             <p>Please ensure the backend server is running and Streamlit has started successfully.</p>
             <button onclick="window.location.reload()">Try Again</button>
           </div>`;
     }
  };

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden relative border border-[#30363D]/60 rounded-md bg-[#0D1117]", // Dark background
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363D] bg-[#161B22]">
        <h3 className="text-sm font-semibold text-gray-300">Streamlit Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshPreview}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#30363D] transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href={streamlitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#30363D] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Iframe Content */}
      <div className="flex-grow relative bg-white"> {/* Streamlit usually has a light background */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
            <div className="text-center text-gray-600">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading Preview...
            </div>
          </div>
        )}
        {iframeSrc && (
            <iframe
                key={iframeSrc} // Use key to ensure iframe re-renders completely on src change
                ref={iframeRef}
                src={iframeSrc}
                className={cn(
                    "w-full h-full border-0 transition-opacity duration-300",
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                title="Streamlit Preview"
                sandbox="allow-scripts allow-popups allow-forms allow-same-origin" // Standard sandbox for iframes
                onLoad={handleLoad}
                onError={handleError}
            />
        )}
        {!iframeSrc && !isLoading && (
             <div className="p-4 text-gray-600">
                 Waiting for Streamlit application URL...
             </div>
        )}
      </div>
    </div>
  );
};

export default StreamlitPreviewPanel; 