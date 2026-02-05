'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, Zap } from 'lucide-react';

export default function BuildAudienceDemo() {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-light text-gray-900 mb-2">
          Build Your Audience
        </h3>
        <p className="text-base text-gray-600">
          Create targeted segments that grow automatically
        </p>
      </motion.div>

      {/* Simple Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">280M+</div>
          <div className="text-sm text-gray-600">Total Profiles</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Filter className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">30,000+</div>
          <div className="text-sm text-gray-600">Intent Categories</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">Instant</div>
          <div className="text-sm text-gray-600">Sync Speed</div>
        </motion.div>
      </div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="bg-[#F7F9FB] rounded-xl p-8"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Intent-Based Targeting</div>
              <div className="text-sm text-gray-600">Target buyers based on active search behavior</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Unlimited Segments</div>
              <div className="text-sm text-gray-600">Create as many audiences as you need</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Auto-Refresh</div>
              <div className="text-sm text-gray-600">Audiences update automatically with fresh data</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Multi-Channel Export</div>
              <div className="text-sm text-gray-600">Activate across ads, email, and CRM</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
