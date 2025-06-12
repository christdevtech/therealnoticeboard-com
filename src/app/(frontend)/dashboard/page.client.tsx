'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const { theme } = useTheme()

  useEffect(() => {
    if (theme) setHeaderTheme(theme)
  }, [setHeaderTheme])
  return <React.Fragment />
}

export default PageClient
