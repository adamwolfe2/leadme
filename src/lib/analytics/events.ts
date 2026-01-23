// Analytics Events
// Predefined event tracking for common user actions

import { track } from './client'

/**
 * Authentication Events
 */
export const authEvents = {
  signupStarted: (method: 'email' | 'oauth') => {
    track('Signup Started', { method })
  },

  signupCompleted: (userId: string, method: 'email' | 'oauth') => {
    track('Signup Completed', { userId, method })
  },

  loginCompleted: (userId: string) => {
    track('Login Completed', { userId })
  },

  logoutCompleted: () => {
    track('Logout Completed')
  },
}

/**
 * Query Events
 */
export const queryEvents = {
  queryCreated: (queryId: string, topic: string) => {
    track('Query Created', { queryId, topic })
  },

  queryUpdated: (queryId: string) => {
    track('Query Updated', { queryId })
  },

  queryDeleted: (queryId: string) => {
    track('Query Deleted', { queryId })
  },

  queryActivated: (queryId: string) => {
    track('Query Activated', { queryId })
  },

  queryPaused: (queryId: string) => {
    track('Query Paused', { queryId })
  },
}

/**
 * Lead Events
 */
export const leadEvents = {
  leadViewed: (leadId: string) => {
    track('Lead Viewed', { leadId })
  },

  leadExported: (count: number, format: string) => {
    track('Lead Exported', { count, format })
  },

  leadFiltered: (filters: Record<string, any>) => {
    track('Lead Filtered', { filters })
  },
}

/**
 * People Search Events
 */
export const peopleSearchEvents = {
  searchPerformed: (filters: Record<string, any>, resultCount: number) => {
    track('People Search Performed', { filters, resultCount })
  },

  emailRevealed: (resultId: string, creditsRemaining: number) => {
    track('Email Revealed', { resultId, creditsRemaining })
  },

  searchSaved: (searchName: string) => {
    track('Search Saved', { searchName })
  },
}

/**
 * Billing Events
 */
export const billingEvents = {
  checkoutStarted: (plan: string, interval: 'monthly' | 'yearly') => {
    track('Checkout Started', { plan, interval })
  },

  subscriptionCreated: (plan: string, amount: number) => {
    track('Subscription Created', { plan, amount })
  },

  subscriptionCancelled: (plan: string) => {
    track('Subscription Cancelled', { plan })
  },

  subscriptionResumed: (plan: string) => {
    track('Subscription Resumed', { plan })
  },

  upgradeClicked: (currentPlan: string, targetPlan: string) => {
    track('Upgrade Clicked', { currentPlan, targetPlan })
  },
}

/**
 * Credit Events
 */
export const creditEvents = {
  creditUsed: (action: string, creditsUsed: number, creditsRemaining: number) => {
    track('Credit Used', { action, creditsUsed, creditsRemaining })
  },

  creditLimitReached: (plan: string) => {
    track('Credit Limit Reached', { plan })
  },

  creditsReset: () => {
    track('Credits Reset')
  },
}

/**
 * Onboarding Events
 */
export const onboardingEvents = {
  onboardingStarted: () => {
    track('Onboarding Started')
  },

  onboardingStepCompleted: (step: number, stepName: string) => {
    track('Onboarding Step Completed', { step, stepName })
  },

  onboardingCompleted: () => {
    track('Onboarding Completed')
  },

  onboardingSkipped: (step: number) => {
    track('Onboarding Skipped', { step })
  },
}

/**
 * Feature Usage Events
 */
export const featureEvents = {
  featureUsed: (featureName: string) => {
    track('Feature Used', { featureName })
  },

  exportStarted: (type: 'csv' | 'pdf') => {
    track('Export Started', { type })
  },

  exportCompleted: (type: 'csv' | 'pdf', recordCount: number) => {
    track('Export Completed', { type, recordCount })
  },

  integrationConnected: (integration: string) => {
    track('Integration Connected', { integration })
  },

  integrationDisconnected: (integration: string) => {
    track('Integration Disconnected', { integration })
  },
}

/**
 * Error Events
 */
export const errorEvents = {
  errorOccurred: (error: string, context?: Record<string, any>) => {
    track('Error Occurred', { error, ...context })
  },

  apiErrorOccurred: (endpoint: string, statusCode: number, error: string) => {
    track('API Error', { endpoint, statusCode, error })
  },
}

/**
 * Navigation Events
 */
export const navigationEvents = {
  pageViewed: (pageName: string, url: string) => {
    track('Page Viewed', { pageName, url })
  },

  ctaClicked: (ctaName: string, location: string) => {
    track('CTA Clicked', { ctaName, location })
  },

  linkClicked: (linkText: string, destination: string) => {
    track('Link Clicked', { linkText, destination })
  },
}
