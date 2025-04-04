// Utility functions for animations

// This function helps convert the next-themes theme value to a boolean for animations
export function isDarkTheme(theme: string | undefined): boolean {
  return theme === 'dark'
}

// Color utilities for animations
export function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? '#050818' : '#f8faff',
    primary: isDark ? 'rgba(0, 240, 255, 0.8)' : 'rgba(0, 54, 73, 0.8)',
    secondary: isDark ? 'rgba(168, 85, 247, 0.7)' : 'rgba(100, 50, 150, 0.7)',
    text: isDark ? 'rgba(230, 240, 255, 0.9)' : 'rgba(10, 20, 30, 0.9)',
    muted: isDark ? 'rgba(150, 160, 180, 0.6)' : 'rgba(100, 110, 130, 0.6)',
  }
}

// Easing functions (duplicated from utils.ts for convenience)
export const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

// Color interpolation
export function lerpColor(color1: string, color2: string, t: number): string {
  const parseRgba = (rgbaStr: string) => {
    try {
      const rgba = rgbaStr.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0, 1]
      return rgba.length === 3 ? [...rgba, 1] : rgba
    } catch (e) {
      return [0, 0, 0, 1]
    }
  }

  const c1 = parseRgba(color1)
  const c2 = parseRgba(color2)
  const progress = Math.max(0, Math.min(1, t))

  const r = Math.round(c1[0] + (c2[0] - c1[0]) * progress)
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * progress)
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * progress)
  const a = Math.max(0, Math.min(1, c1[3] + (c2[3] - c1[3]) * progress)).toFixed(2)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}
