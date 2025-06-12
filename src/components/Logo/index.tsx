import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  theme?: 'light' | 'dark' | null
}

const Logo = (props: Props) => {
  const {
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    theme = 'light',
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="The Notice Board Logo"
      width={250}
      height={84.41}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('w-[250px]', className)}
      src={theme === 'light' ? '/logo-light.svg' : '/logo-dark.svg'}
    />
  )
}

export default Logo
export { Logo }
