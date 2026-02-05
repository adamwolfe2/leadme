/**
 * A/B Testing Framework - Main Exports
 *
 * Centralized exports for all A/B testing functionality
 */

// Feature Flags & Configuration
export {
  getABTestConfig,
  getTest,
  getActiveTests,
  isTestActive,
  updateTestConfig,
  validateTestConfig,
  type ABTest,
  type TestVariant,
  type ABTestConfig,
} from './feature-flags';

// React Components & Hooks
export {
  ABTestWrapper,
  ABTestVariant,
  ABTestSwitch,
  ABTestDebug,
  useABTest,
} from './test-wrapper';

// Analytics Tracking
export {
  trackABTestView,
  trackABTestConversion,
  trackABTestMetric,
  trackABTestEngagement,
  useABTestTimeTracking,
  useABTestScrollTracking,
  initializeGoogleAnalytics,
  initializePostHog,
  getTestResults,
  exportTestResultsToCSV,
} from './analytics';

// Utility Functions
export {
  getUserId,
  hashString,
  assignVariant,
  shouldIncludeInTest,
  getVariantForUser,
  getControlVariant,
  isControlVariant,
  trackTestExposure,
  calculateSampleSize,
  calculateTestDuration,
  calculatePValue,
  calculateConfidenceInterval,
  formatRate,
  formatLift,
  clearAllTestAssignments,
} from './utils';
