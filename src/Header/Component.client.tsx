'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  className?: string
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, className }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const { theme: globalTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    // Reset header theme on route change to allow new page to set it
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    // Use headerTheme if set by special heroes, otherwise fall back to global theme
    const effectiveTheme = headerTheme || globalTheme
    if (effectiveTheme && effectiveTheme !== theme) setTheme(effectiveTheme)
    console.log('Current Theme: ', effectiveTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme, globalTheme])

  return (
    <header className={`relative z-20 ${className}`} {...(theme ? { 'data-theme': theme } : {})}>
      <div className="container">
        <div className="py-4 flex justify-between">
          <Link href="/">
            <Logo
              loading="eager"
              priority="high"
              className=""
              theme={theme && theme === 'dark' ? 'dark' : 'light'}
            />
            {/* <h1 className="text-2xl">The Notice Board</h1> */}
          </Link>
          <HeaderNav data={data} />
        </div>
      </div>
    </header>
  )
}
