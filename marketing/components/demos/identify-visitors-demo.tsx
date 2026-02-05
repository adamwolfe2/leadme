'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Users, Target } from 'lucide-react';

export default function IdentifyVisitorsDemo() {
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
          Identify Visitors
        </h3>
        <p className="text-base text-gray-600">
          Connect your tools to automatically reveal who's on your site
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
            <Eye className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">70%</div>
          <div className="text-sm text-gray-600">Visitors Identified</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">2,847</div>
          <div className="text-sm text-gray-600">Total Contacts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-8 border border-gray-200 text-center"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div className="text-4xl font-light text-gray-900 mb-2">Real-Time</div>
          <div className="text-sm text-gray-600">Live Tracking</div>
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
              <div className="text-gray-900 font-medium mb-1">Company Identification</div>
              <div className="text-sm text-gray-600">Reveal which companies are visiting your site</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Contact Enrichment</div>
              <div className="text-sm text-gray-600">Get full contact details for decision makers</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Intent Signals</div>
              <div className="text-sm text-gray-600">Track behavior and buying signals</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">CRM Sync</div>
              <div className="text-sm text-gray-600">Automatically push data to your CRM</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
