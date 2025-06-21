// import clsx from 'clsx'
import React from 'react'

interface Props {
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

const Icon = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Payload Logo"
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      src={'/favicon.svg'}
    />
  )
}

export default Icon
export { Icon }
