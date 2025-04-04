/**
 * Utility functions for video handling
 */

/**
 * Attempts to play a video with proper error handling
 * @param videoElement The video element to play
 * @param fallbackCallback Optional callback to execute if playback fails
 * @returns A promise that resolves when the video starts playing or rejects with an error
 */
export const safePlayVideo = async (
  videoElement: HTMLVideoElement | null,
  fallbackCallback?: () => void,
): Promise<void> => {
  if (!videoElement) return

  try {
    // Reset video position if it's at the end
    if (videoElement.currentTime >= videoElement.duration - 0.1 || videoElement.ended) {
      videoElement.currentTime = 0
    }

    // Ensure video is muted for autoplay
    videoElement.muted = true

    // Attempt to play the video
    await videoElement.play()
  } catch (error) {
    console.log("Video playback failed:", error)

    // Execute fallback if provided
    if (fallbackCallback) {
      fallbackCallback()
    }
  }
}

/**
 * Checks if a video can autoplay in the current browser environment
 * @returns A promise that resolves to true if autoplay is supported, false otherwise
 */
export const checkAutoplaySupport = async (): Promise<boolean> => {
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true

  // Create a simple test video source
  const source = document.createElement("source")
  source.src =
    "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTI4LjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAwZYiEAD//8m+P5OXfBeLGOfKE3xgP9KAL0BkNkFLTX/ALQO0fFPJCwUQs+KcwvQQ="
  source.type = "video/mp4"
  video.appendChild(source)

  try {
    await video.play()
    return true
  } catch (error) {
    return false
  } finally {
    video.remove()
  }
}

/**
 * Preloads video sources to improve playback performance
 * @param videoSources Array of video URLs to preload
 */
export const preloadVideos = (videoSources: string[]): void => {
  videoSources.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = src
    link.as = "video"
    link.type = "video/mp4"
    document.head.appendChild(link)
  })
}

