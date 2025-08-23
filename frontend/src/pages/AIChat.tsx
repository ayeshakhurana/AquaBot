import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Bot, Upload, FileText, Send, Paperclip } from 'lucide-react';
import ChatBox from '../components/ChatBox';

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Quick questions with predefined prompts
  const quickQuestions = [
    {
      id: 1,
      question: "What are the key maritime regulations?",
      prompt: "Explain the key maritime regulations and compliance requirements for international shipping."
    },
    {
      id: 2,
      question: "How to calculate laytime?",
      prompt: "Explain how to calculate laytime for charter party operations and what factors affect it."
    },
    {
      id: 3,
      question: "Port safety procedures?",
      prompt: "What are the essential safety procedures when entering and operating in ports?"
    },
    {
      id: 4,
      question: "Cargo handling best practices?",
      prompt: "What are the best practices for safe and efficient cargo handling operations?"
    }
  ];

  const handleQuickQuestion = (prompt: string) => {
    // Set the question in the chat input
    const chatInput = document.querySelector('input[placeholder*="maritime"]') as HTMLInputElement;
    if (chatInput) {
      chatInput.value = prompt;
      // Trigger the input change event
      const event = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(event);
    }
  };
  
  // Get initial query from search if available
  const initialQuery = location.state?.initialQuery || '';

  useEffect(() => {
    if (initialQuery) {
      // The document upload logic is now handled within ChatBox
    }
  }, [initialQuery]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#001F3F] to-[#001F3F]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-[#39CCCC]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#0074D9]/20 border border-[#39CCCC]/30">
                <MessageCircle className="w-6 h-6 text-[#39CCCC]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Chat Assistant</h1>
                <p className="text-[#ADB5BD]">Get maritime expertise from our intelligent agents</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Questions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.prompt)}
                  className="p-3 text-left bg-[#0074D9]/20 rounded-lg border border-[#39CCCC]/30 hover:bg-[#0074D9]/30 hover:border-[#39CCCC]/50 transition-all duration-300 text-sm text-white backdrop-blur-md"
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
            <ChatBox className="h-[700px]" />
          </div>
        </motion.div>

        {/* Features Info */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">AI Chat Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#0074D9]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#39CCCC]/30">
                  <MessageCircle className="w-8 h-8 text-[#39CCCC]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Intelligent Agents</h3>
                <p className="text-[#ADB5BD]">Specialized AI agents for weather, navigation, documents, and maritime operations</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#2ECC40]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#2ECC40]/30">
                  <svg className="w-8 h-8 text-[#2ECC40]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Document Analysis</h3>
                <p className="text-[#ADB5BD]">Upload and analyze maritime documents with AI-powered insights</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#39CCCC]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#39CCCC]/30">
                  <svg className="w-8 h-8 text-[#39CCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Responses</h3>
                <p className="text-[#ADB5BD]">Instant answers to maritime questions with live data integration</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIChat; 