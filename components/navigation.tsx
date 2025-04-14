"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#050818]/90 backdrop-blur-md border-b border-blue-500/20 shadow-lg shadow-blue-900/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/ron-ai-logo.png"
                alt="Ron AI Logo"
                width={180}
                height={50}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <NavLink href="/" isActive={isActive("/")}>
                Home
              </NavLink>
              <NavLink href="/solutions" isActive={isActive("/solutions")}>
                Solutions
              </NavLink>
              <NavLink href="/blog" isActive={isActive("/blog")}>
                Blog
              </NavLink>
              <NavLink href="/about" isActive={isActive("/about")}>
                About
              </NavLink>
              <NavLink href="/contact" isActive={isActive("/contact")}>
                Contact
              </NavLink>
              <Link
                href="/demo"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-400/20 flex items-center gap-1"
              >
                Request Demo
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-300 hover:text-cyan-300 focus:outline-none transition-all duration-200 transform hover:scale-105 hover:bg-blue-900/20"
              aria-label="Toggle menu"
            >
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden fixed top-16 left-0 right-0 z-[90]`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#050818]/95 backdrop-blur-md border-b border-blue-500/20 shadow-lg shadow-blue-900/10">
          <MobileNavLink href="/" isActive={isActive("/")}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/solutions" isActive={isActive("/solutions")}>
            Solutions
          </MobileNavLink>
          <MobileNavLink href="/blog" isActive={isActive("/blog")}>
            Blog
          </MobileNavLink>
          <MobileNavLink href="/about" isActive={isActive("/about")}>
            About
          </MobileNavLink>
          <MobileNavLink href="/contact" isActive={isActive("/contact")}>
            Contact
          </MobileNavLink>
          <div className="pt-2">
            <Link
              href="/demo"
              className="block w-full text-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium border border-blue-400/20 shadow-md shadow-blue-900/20 flex items-center justify-center gap-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Request Demo
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`${
        isActive
          ? "text-white font-semibold"
          : "text-blue-100/90 hover:text-cyan-300"
      } px-2 py-2 text-sm font-medium transition-all duration-200 relative group`}
    >
      {children}
      <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400/70 transition-all duration-300 ${isActive ? 'w-full' : 'group-hover:w-full'}`}></span>
    </Link>
  )
}

function MobileNavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`${
        isActive
          ? "bg-blue-900/40 text-cyan-300 border-l-2 border-cyan-400"
          : "text-blue-100/90 hover:bg-blue-900/30 hover:text-cyan-300 hover:border-l-2 hover:border-cyan-400/50"
      } block px-4 py-3 rounded-md text-base font-medium transition-all duration-200`}
    >
      {children}
    </Link>
  )
}
