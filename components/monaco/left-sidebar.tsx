'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileCode, Settings, Bot, Terminal, Server, Database } from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  className?: string;
  onFileSelect: (language: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  toggle,
  className,
  onFileSelect
}) => {
  const fileTypes = [
    { name: 'JavaScript', icon: <FileCode className="h-5 w-5 text-yellow-400" />, language: 'javascript' },
    { name: 'HTML', icon: <FileCode className="h-5 w-5 text-orange-400" />, language: 'html' },
    { name: 'Python', icon: <FileCode className="h-5 w-5 text-blue-400" />, language: 'python' }
  ];

  return (
    <div className={cn(
      "relative flex flex-col h-full transition-all duration-300 ease-in-out bg-[#050818]/80 backdrop-blur-md border-r border-[#30363D]/60",
      isOpen ? "w-56" : "w-12",
      className
    )}>
      {/* Toggle button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-12 z-10 p-1 rounded-full bg-[#00e5e0] text-[#050818] hover:bg-[#00e5e0]/80 transition-all"
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Header */}
      <div className="p-3 border-b border-[#30363D]/60 flex items-center justify-between">
        {isOpen ? (
          <span className="text-[#00e5e0] font-semibold">Explorer</span>
        ) : null}
        <Bot 
          className={cn(
            "h-5 w-5 text-[#00e5e0]",
            !isOpen && "mx-auto"
          )} 
        />
      </div>

      {/* File explorer */}
      <div className={cn(
        "p-2 overflow-y-auto flex-grow",
        !isOpen && "items-center"
      )}>
        <div className={cn(
          "mb-4",
          !isOpen && "flex flex-col items-center"
        )}>
          {isOpen && <h3 className="text-xs font-semibold text-[#94a3b8] mb-2">TEMPLATES</h3>}
          <ul>
            {fileTypes.map((fileType, index) => (
              <li key={index}>
                <button
                  onClick={() => onFileSelect(fileType.language)}
                  className={cn(
                    "w-full flex items-center p-2 rounded-md hover:bg-[#30363D]/40 transition-colors",
                    !isOpen && "justify-center"
                  )}
                >
                  {fileType.icon}
                  {isOpen && <span className="ml-2 text-sm text-[#e2e8f0]">{fileType.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {isOpen && (
          <>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#94a3b8] mb-2">TOOLS</h3>
              <ul>
                <li>
                  <button className="w-full flex items-center p-2 rounded-md hover:bg-[#30363D]/40 transition-colors">
                    <Terminal className="h-5 w-5 text-[#94a3b8]" />
                    <span className="ml-2 text-sm text-[#e2e8f0]">Terminal</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 rounded-md hover:bg-[#30363D]/40 transition-colors">
                    <Server className="h-5 w-5 text-[#94a3b8]" />
                    <span className="ml-2 text-sm text-[#e2e8f0]">API Explorer</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 rounded-md hover:bg-[#30363D]/40 transition-colors">
                    <Database className="h-5 w-5 text-[#94a3b8]" />
                    <span className="ml-2 text-sm text-[#e2e8f0]">Database</span>
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#30363D]/60 flex items-center justify-between">
        {isOpen ? (
          <span className="text-[#94a3b8] text-xs">Ron AI IDE</span>
        ) : null}
        <Settings 
          className={cn(
            "h-5 w-5 text-[#94a3b8]",
            !isOpen && "mx-auto"
          )} 
        />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-[1px] -z-10 bg-gradient-to-b from-[#00e5e0]/20 via-transparent to-[#3b82f6]/20 rounded-l-md opacity-50 blur-[2px] pointer-events-none" />
    </div>
  );
};

export default LeftSidebar;
