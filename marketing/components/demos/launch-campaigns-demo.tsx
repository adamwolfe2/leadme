'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, MessageSquare, Send } from 'lucide-react';

export default function LaunchCampaignsDemo() {
  const channels = [
    { name: 'Email', icon: Mail, active: true },
    { name: 'LinkedIn', icon: Linkedin, active: true },
    { name: 'Direct Mail', icon: MessageSquare, active: true },
    { name: 'SMS', icon: Send, active: false },
  ];

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
          Launch Campaigns
        </h3>
        <p className="text-base text-gray-600">
          Orchestrate personalized outreach across every channel
        </p>
      </motion.div>

      {/* Channel Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 border-2 text-center ${
                channel.active ? 'border-[#007AFF]' : 'border-gray-200'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                  channel.active ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 ${channel.active ? 'text-[#007AFF]' : 'text-gray-400'}`} />
              </div>
              <div className={`text-sm font-medium ${channel.active ? 'text-gray-900' : 'text-gray-400'}`}>
                {channel.name}
              </div>
              {channel.active && (
                <div className="text-xs text-[#007AFF] mt-2">Active</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200 text-center"
        >
          <div className="text-3xl font-light text-gray-900 mb-1">6</div>
          <div className="text-sm text-gray-600">Active Channels</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200 text-center"
        >
          <div className="text-3xl font-light text-gray-900 mb-1">14%</div>
          <div className="text-sm text-gray-600">Reply Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 border border-gray-200 text-center"
        >
          <div className="text-3xl font-light text-gray-900 mb-1">98%</div>
          <div className="text-sm text-gray-600">Deliverability</div>
        </motion.div>
      </div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
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
              <div className="text-gray-900 font-medium mb-1">AI Personalization</div>
              <div className="text-sm text-gray-600">Every message customized for the recipient</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Multi-Touch Sequences</div>
              <div className="text-sm text-gray-600">Coordinated outreach across channels</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Smart Timing</div>
              <div className="text-sm text-gray-600">Send at optimal times for engagement</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-medium mb-1">Real-Time Analytics</div>
              <div className="text-sm text-gray-600">Track performance across all channels</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
