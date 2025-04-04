"use client"

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

interface AnimationWrapperProps {
  children: ReactNode
}

export function AnimationWrapper({ children }: AnimationWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}
