'use client';

/**
 * A/B Test Wrapper Component
 *
 * React component for easy A/B testing in Next.js applications.
 * Handles variant assignment, tracking, and consistent rendering.
 */

import { ReactNode, useEffect, useState } from 'react';
import { ABTest, TestVariant, getTest, isTestActive } from './feature-flags';
import { getUserId, getVariantForUser, trackTestExposure, getControlVariant } from './utils';
import { trackABTestView, trackABTestConversion } from './analytics';

interface ABTestWrapperProps {
  /**
   * Unique test ID (matches ID in feature-flags.ts)
   */
  testId: string;

  /**
   * Child render function - receives assigned variant
   */
  children: (variant: TestVariant) => ReactNode;

  /**
   * Optional: Force a specific variant (for testing)
   */
  forceVariant?: string;

  /**
   * Optional: Callback when variant is assigned
   */
  onVariantAssigned?: (variant: TestVariant) => void;

  /**
   * Optional: Track exposure automatically (default: true)
   */
  trackExposure?: boolean;

  /**
   * Optional: Fallback content while loading test config
   */
  loadingFallback?: ReactNode;
}

/**
 * ABTestWrapper - Main component for A/B testing
 *
 * Usage:
 * ```tsx
 * <ABTestWrapper testId="homepage-hero-cta">
 *   {(variant) => (
 *     <Button>{variant.name}</Button>
 *   )}
 * </ABTestWrapper>
 * ```
 */
export function ABTestWrapper({
  testId,
  children,
  forceVariant,
  onVariantAssigned,
  trackExposure = true,
  loadingFallback = null,
}: ABTestWrapperProps) {
  const [test, setTest] = useState<ABTest | null>(null);
  const [variant, setVariant] = useState<TestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(() => getUserId());

  // Load test configuration
  useEffect(() => {
    async function loadTest() {
      try {
        const testConfig = await getTest(testId);

        if (!testConfig) {
          console.warn(`A/B test not found: ${testId}`);
          setIsLoading(false);
          return;
        }

        setTest(testConfig);

        // Determine variant assignment
        let assignedVariant: TestVariant;

        if (forceVariant) {
          // Force specific variant (for testing)
          const forced = testConfig.variants.find(v => v.id === forceVariant);
          assignedVariant = forced || getControlVariant(testConfig);
        } else if (!isTestActive(testConfig)) {
          // Test not active, use control
          assignedVariant = getControlVariant(testConfig);
        } else {
          // Normal assignment
          const userVariant = getVariantForUser(testConfig, userId);
          assignedVariant = userVariant || getControlVariant(testConfig);
        }

        setVariant(assignedVariant);

        // Track exposure
        if (trackExposure && isTestActive(testConfig)) {
          trackTestExposure(testId, assignedVariant.id, userId);
          trackABTestView(testId, assignedVariant.id);
        }

        // Callback
        if (onVariantAssigned) {
          onVariantAssigned(assignedVariant);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading A/B test:', error);
        setIsLoading(false);
      }
    }

    loadTest();
  }, [testId, forceVariant, userId, trackExposure, onVariantAssigned]);

  // Show loading state
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Test not found or variant not assigned, render nothing
  if (!test || !variant) {
    return null;
  }

  // Render variant
  return <>{children(variant)}</>;
}

/**
 * Hook for programmatic A/B testing
 *
 * Usage:
 * ```tsx
 * const { variant, trackConversion } = useABTest('homepage-hero-cta');
 *
 * return (
 *   <Button onClick={() => {
 *     // Do something
 *     trackConversion('demo_booked');
 *   }}>
 *     {variant?.name || 'Book a Demo'}
 *   </Button>
 * );
 * ```
 */
export function useABTest(testId: string, forceVariant?: string) {
  const [test, setTest] = useState<ABTest | null>(null);
  const [variant, setVariant] = useState<TestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(() => getUserId());

  useEffect(() => {
    async function loadTest() {
      try {
        const testConfig = await getTest(testId);

        if (!testConfig) {
          setIsLoading(false);
          return;
        }

        setTest(testConfig);

        let assignedVariant: TestVariant;

        if (forceVariant) {
          const forced = testConfig.variants.find(v => v.id === forceVariant);
          assignedVariant = forced || getControlVariant(testConfig);
        } else if (!isTestActive(testConfig)) {
          assignedVariant = getControlVariant(testConfig);
        } else {
          const userVariant = getVariantForUser(testConfig, userId);
          assignedVariant = userVariant || getControlVariant(testConfig);
        }

        setVariant(assignedVariant);

        // Track exposure
        if (isTestActive(testConfig)) {
          trackTestExposure(testId, assignedVariant.id, userId);
          trackABTestView(testId, assignedVariant.id);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading A/B test:', error);
        setIsLoading(false);
      }
    }

    loadTest();
  }, [testId, forceVariant, userId]);

  const trackConversion = (conversionType?: string) => {
    if (!test || !variant) return;
    trackABTestConversion(testId, variant.id, conversionType);
  };

  return {
    test,
    variant,
    isLoading,
    isActive: test ? isTestActive(test) : false,
    trackConversion,
  };
}

/**
 * Simple conditional A/B test component
 *
 * Usage:
 * ```tsx
 * <ABTestVariant testId="homepage-hero-cta" variantId="control">
 *   <Button>Book a Demo</Button>
 * </ABTestVariant>
 *
 * <ABTestVariant testId="homepage-hero-cta" variantId="variant-b">
 *   <Button>See Cursive in Action</Button>
 * </ABTestVariant>
 * ```
 */
export function ABTestVariant({
  testId,
  variantId,
  children,
}: {
  testId: string;
  variantId: string;
  children: ReactNode;
}) {
  const { variant, isLoading } = useABTest(testId);

  if (isLoading) return null;
  if (!variant || variant.id !== variantId) return null;

  return <>{children}</>;
}

/**
 * Multi-variant switch component
 *
 * Usage:
 * ```tsx
 * <ABTestSwitch testId="homepage-hero-cta">
 *   {{
 *     control: <Button>Book a Demo</Button>,
 *     'variant-b': <Button>See Cursive in Action</Button>,
 *     'variant-c': <Button>Identify Your Visitors</Button>,
 *   }}
 * </ABTestSwitch>
 * ```
 */
export function ABTestSwitch({
  testId,
  children,
  fallback,
}: {
  testId: string;
  children: Record<string, ReactNode>;
  fallback?: ReactNode;
}) {
  const { variant, isLoading } = useABTest(testId);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  if (!variant) {
    return <>{fallback || null}</>;
  }

  return <>{children[variant.id] || fallback || null}</>;
}

/**
 * Debug component to show current variant assignment
 * Only renders in development
 */
export function ABTestDebug({ testId }: { testId: string }) {
  const { test, variant, isActive } = useABTest(testId);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!test || !variant) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      <strong>A/B Test: {test.name}</strong>
      <br />
      Variant: {variant.id} ({variant.name})
      <br />
      Active: {isActive ? 'Yes' : 'No'}
    </div>
  );
}
