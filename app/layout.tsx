import type React from "react"
import type { Metadata } from "next"
import { Inter, Audiowide, Fira_Code } from "next/font/google"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import Navigation from "@/components/navigation"
import Footer from "@/components/Footer"
import { ChatbotUI } from "@/components/chatbot-ui" // Import the Chatbot UI
import { TooltipProvider } from "@/components/ui/tooltip" // Import TooltipProvider
import { GlobalFlashlight } from "@/components/global-flashlight" // Import GlobalFlashlight
import "./globals.css"

// Configure the Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
})

// Configure the Audiowide font
const audiowide = Audiowide({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-audiowide",
  weight: "400",
})

// Configure the Fira Code font
const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Ron AI - Healthcare Intelligence",
  description: "Advanced AI solutions for healthcare",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${audiowide.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body>
        <ClientThemeProvider>
          <TooltipProvider>
            <GlobalFlashlight>
              <Navigation />
              <main className="flex-grow">{children}</main> {/* Optional: Wrap children in main */}
              <Footer />
              <ChatbotUI /> {/* Add the Chatbot UI component here */}
              {/* Removed MonacoThemeInitializer component */}
            </GlobalFlashlight>
          </TooltipProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}
