'use client'

import React, { useState, useEffect } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon, Menu, X } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      setIsMobileMenuOpen(true)
      // Small delay to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsMobileMenuOpen(false)
      }, 300)
    }
  }

  const closeMobileMenu = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsMobileMenuOpen(false)
    }, 300)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-3 items-center">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
        <Link href="/search">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-primary" />
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3">
        <Link href="/search">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-primary" />
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-primary hover:text-primary/80 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop with blur */}
          <div
            className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />

          {/* Slide-out Menu */}
          <div
            className={`absolute left-0 top-0 h-full w-[min(300px,90vw)] bg-card border-r border-border shadow-xl transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground px-4">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {navItems.map(({ link }, i) => (
                <div key={i} onClick={closeMobileMenu}>
                  <CMSLink
                    {...link}
                    appearance="link"
                    className="block py-3 px-4 text-foreground hover:bg-muted rounded-md transition-colors text-base font-medium"
                  />
                </div>
              ))}

              {/* Search Link */}
              <div onClick={closeMobileMenu}>
                <Link
                  href="/search"
                  className="flex items-center gap-3 py-3 px-4 text-foreground hover:bg-muted rounded-md transition-colors text-base font-medium"
                >
                  <SearchIcon className="w-5 h-5 text-primary" />
                  Search
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
