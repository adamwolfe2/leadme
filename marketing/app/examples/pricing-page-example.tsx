'use client';

/**
 * Example: Pricing Page Structure A/B Test
 *
 * This demonstrates Test #2 from the priority tests:
 * Testing different pricing structures to reduce decision paralysis
 */

import { ABTestSwitch, useABTest, trackABTestMetric } from '@/lib/ab-testing';
import { useEffect, useState } from 'react';

// Control: 3 Tiers
function ThreeTierPricing() {
  return (
    <div className="pricing-grid grid grid-cols-3 gap-8 max-w-6xl mx-auto">
      <PricingCard
        name="Data"
        price="$499"
        features={[
          'Visitor Identification',
          '100K visitors/month',
          'Basic integrations',
          'Email support',
        ]}
      />
      <PricingCard
        name="Platform"
        price="$999"
        features={[
          'Everything in Data',
          'AI Studio',
          'Audience Builder',
          'Priority support',
        ]}
        highlighted
      />
      <PricingCard
        name="Managed"
        price="$2,499"
        features={[
          'Everything in Platform',
          'Dedicated success manager',
          'Custom integrations',
          'White-label options',
        ]}
      />
    </div>
  );
}

// Variant B: 2 Tiers + Contact
function TwoTierPlusCTA() {
  return (
    <div className="pricing-grid grid grid-cols-2 gap-8 max-w-4xl mx-auto">
      <PricingCard
        name="Platform"
        price="$999"
        features={[
          'Visitor Identification',
          'AI Studio',
          'Audience Builder',
          '200K visitors/month',
          'Priority support',
        ]}
        highlighted
      />
      <div className="border-2 border-gray-200 rounded-lg p-8 flex flex-col justify-center items-center">
        <h3 className="text-2xl font-medium mb-4">Enterprise</h3>
        <p className="text-gray-600 mb-6 text-center">
          Custom solutions for large teams with advanced requirements
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Contact Sales
        </button>
      </div>
    </div>
  );
}

// Variant C: Single Plan
function SinglePlanCustom() {
  return (
    <div className="max-w-md mx-auto">
      <div className="border-2 border-blue-600 rounded-lg p-8 text-center">
        <h3 className="text-3xl font-medium mb-4">Cursive Platform</h3>
        <p className="text-gray-600 mb-6">
          All features included. Pricing based on your traffic volume and needs.
        </p>
        <div className="mb-6">
          <span className="text-4xl font-bold">Custom Pricing</span>
        </div>
        <ul className="text-left mb-8 space-y-2">
          <li>✓ Visitor Identification</li>
          <li>✓ AI Studio</li>
          <li>✓ Audience Builder</li>
          <li>✓ Direct Mail Automation</li>
          <li>✓ 200+ Integrations</li>
          <li>✓ Priority Support</li>
        </ul>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full">
          Get Custom Quote
        </button>
      </div>
    </div>
  );
}

// Helper Component
function PricingCard({
  name,
  price,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`border-2 rounded-lg p-8 ${
        highlighted ? 'border-blue-600 shadow-lg' : 'border-gray-200'
      }`}
    >
      <h3 className="text-2xl font-medium mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-6">{price}</div>
      <ul className="space-y-2 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="text-gray-600">
            ✓ {feature}
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 rounded-lg ${
          highlighted
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

// Main Pricing Page Component
export default function PricingPageExample() {
  const { variant, trackConversion } = useABTest('pricing-page-structure');
  const [startTime] = useState(Date.now());

  // Track time on page
  useEffect(() => {
    return () => {
      if (variant) {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackABTestMetric(
          'pricing-page-structure',
          variant.id,
          'time_on_page',
          timeOnPage
        );
      }
    };
  }, [variant, startTime]);

  // Track contact form click
  const handleContactClick = () => {
    if (variant) {
      trackConversion('contact_clicked');
    }
  };

  return (
    <div className="pricing-page py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* A/B Test: Pricing Structure */}
        <ABTestSwitch testId="pricing-page-structure">
          {{
            control: <ThreeTierPricing />,
            'variant-b': <TwoTierPlusCTA />,
            'variant-c': <SinglePlanCustom />,
          }}
        </ABTestSwitch>

        <div className="text-center mt-12">
          <button
            onClick={handleContactClick}
            className="text-blue-600 hover:underline"
          >
            Have questions? Contact our team →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Alternative: Hook-based approach with custom logic
 */
export function PricingPageHookExample() {
  const { variant, trackConversion, isLoading } = useABTest(
    'pricing-page-structure'
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handlePlanSelect = (planName: string) => {
    trackConversion(`plan_selected_${planName.toLowerCase()}`);
    // Navigate to signup
  };

  // Render different UIs based on variant
  if (variant?.id === 'control') {
    return <ThreeTierPricing />;
  }

  if (variant?.id === 'variant-b') {
    return <TwoTierPlusCTA />;
  }

  if (variant?.id === 'variant-c') {
    return <SinglePlanCustom />;
  }

  // Fallback
  return <ThreeTierPricing />;
}
