'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

const PIXEL_CODE = `<!-- Cursive Tracking Pixel -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.cursive.io/pixel.js';
    script.async = true;
    script.dataset.projectId = 'proj_abc123xyz';
    document.head.appendChild(script);
  })();
</script>`;

interface Visitor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
}

const VISITORS: Visitor[] = [
  { id: 1, firstName: 'Sarah', lastName: 'Chen', email: 'sarah@techcorp.com', jobTitle: 'VP of Marketing' },
  { id: 2, firstName: 'Michael', lastName: 'Rodriguez', email: 'michael@startup.io', jobTitle: 'Head of Growth' },
  { id: 3, firstName: 'Emma', lastName: 'Williams', email: 'emma@enterprise.com', jobTitle: 'Director of Sales' },
  { id: 4, firstName: 'James', lastName: 'Park', email: 'james@saascompany.com', jobTitle: 'CEO' },
];

export default function InstallPixelDemo() {
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [showVisitors, setShowVisitors] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView && !isTyping) {
      setIsTyping(true);
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= PIXEL_CODE.length) {
          setTypedCode(PIXEL_CODE.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Start counter animation after typing completes
          setTimeout(() => {
            animateCounter();
          }, 500);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [isInView]);

  const animateCounter = () => {
    const duration = 3000;
    const steps = 60;
    const increment = 47 / steps;
    let current = 0;

    const counterInterval = setInterval(() => {
      current += increment;
      if (current >= 47) {
        setVisitorCount(47);
        clearInterval(counterInterval);
        // Show visitor cards after counter completes
        setTimeout(() => {
          setShowVisitors(true);
        }, 500);
      } else {
        setVisitorCount(Math.floor(current));
      }
    }, duration / steps);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PIXEL_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div ref={ref} className="w-full max-w-[1200px] mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center"
      >
        <h2 className="text-5xl font-semibold text-white mb-4">
          Install Tracking Pixel
        </h2>
        <p className="text-xl text-gray-400">
          Add one line of code to start identifying your website visitors
        </p>
      </motion.div>

      {/* Code Editor */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[800px] mx-auto mb-16"
      >
        <div className="relative bg-[#2D2D2D] rounded-lg overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <span className="text-sm text-gray-400 font-mono">index.html</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all"
              aria-label="Copy code"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <pre className="text-gray-300">
              <code>
                <span className="text-gray-500">&lt;!-- Cursive Tracking Pixel --&gt;</span>
                {'\n'}
                <span className="text-[#FF79C6]">&lt;script&gt;</span>
                {'\n'}
                {'  '}
                <span className="text-[#F1FA8C]">(function</span>
                <span className="text-gray-300]">()</span>
                {' '}
                <span className="text-[#FF79C6]">{'{'}</span>
                {'\n'}
                {'    '}
                <span className="text-[#8BE9FD]">var</span>
                {' '}
                <span className="text-gray-300">script</span>
                {' = '}
                <span className="text-gray-300">document</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-[#50FA7B]">createElement</span>
                <span className="text-gray-300">(</span>
                <span className="text-[#F1FA8C]">'script'</span>
                <span className="text-gray-300">);</span>
                {'\n'}
                {'    '}
                <span className="text-gray-300">script</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-gray-300">src</span>
                {' = '}
                <span className="text-[#F1FA8C]">'https://cdn.cursive.io/pixel.js'</span>
                <span className="text-gray-300">;</span>
                {'\n'}
                {'    '}
                <span className="text-gray-300">script</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-gray-300">async</span>
                {' = '}
                <span className="text-[#BD93F9]">true</span>
                <span className="text-gray-300">;</span>
                {'\n'}
                {'    '}
                <span className="text-gray-300">script</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-gray-300">dataset</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-gray-300">projectId</span>
                {' = '}
                <span className="text-[#F1FA8C]">'proj_abc123xyz'</span>
                <span className="text-gray-300">;</span>
                {'\n'}
                {'    '}
                <span className="text-gray-300">document</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-gray-300">head</span>
                <span className="text-[#FF79C6]">.</span>
                <span className="text-[#50FA7B]">appendChild</span>
                <span className="text-gray-300">(script);</span>
                {'\n'}
                {'  '}
                <span className="text-[#FF79C6]">{'}'}</span>
                <span className="text-gray-300">)();</span>
                {'\n'}
                <span className="text-[#FF79C6]">&lt;/script&gt;</span>
              </code>
            </pre>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: typedCode.length === PIXEL_CODE.length ? 1 : 0 }}
              className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"
            />
          </div>
        </div>

        {/* Success Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: visitorCount > 0 ? 1 : 0,
            y: visitorCount > 0 ? 0 : 10
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mt-6 text-gray-300"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">Installed!</span>
          </div>
          <span className="text-sm">
            Tracking{' '}
            <motion.span
              key={visitorCount}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-white"
            >
              {visitorCount}
            </motion.span>
            {' '}visitors
          </span>
        </motion.div>
      </motion.div>

      {/* Visitor Cards */}
      {showVisitors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto"
        >
          {VISITORS.map((visitor, index) => (
            <motion.div
              key={visitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 }
              }}
              className="group relative bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {visitor.firstName[0]}{visitor.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {visitor.firstName} {visitor.lastName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {visitor.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {visitor.jobTitle}
                  </p>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
