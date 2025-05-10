# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start development server (Next.js + RAG server)
- `npm run build` - Build Next.js application
- `npm run lint` - Run Next.js linter
- `npm start` - Start production server
- `npm run cleanup` - Kill all running servers

## Code Style Guidelines
- **Types**: Use TypeScript interfaces for props; strict typing required
- **Imports**: Group imports: React, external libs, internal components, and styles
- **Components**: Use named exports; add displayName property
- **CSS**: Use Tailwind with cn utility for className merging/conditionals
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch with specific error messages for async operations
- **State Management**: Use React hooks (useState, useEffect, custom hooks)
- **Component Structure**: "use client" directive first, then imports, types, component
- **Animations**: Use Framer Motion for transitions and animations
- **UI Components**: Import from @/components/ui and follow shadcn patterns