
/**
 * Sentry Client Configuration
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Don't send dev errors
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry]', event, hint)
      return null
    }
    return event
  },
})
