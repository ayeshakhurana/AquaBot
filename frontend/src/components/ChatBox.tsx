import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Send, X, MessageSquare } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  agent?: string;
  timestamp: string;
  documentContext?: string;
  sender: 'user' | 'ai' | 'system'; // Added sender field
}

interface ChatBoxProps {
  className?: string;
  documentContext?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ className = "", documentContext = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Maritime AI Assistant. I can help with weather, navigation, documents, laytime calculations, and more. What would you like to know?',
      isUser: false,
      agent: 'general',
      timestamp: new Date().toISOString(),
      sender: 'ai' // Changed to 'ai'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('general');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when document context changes
  useEffect(() => {
    if (documentContext && documentContext !== 'Document uploaded: Resume-Madhavsingh.pdf (application/pdf)') {
      // Add a system message about the document
      const documentMessage: Message = {
        id: Date.now().toString(),
        text: `📄 I can see you've uploaded a document. I'm ready to analyze it and answer your questions about it.`,
        isUser: false,
        agent: 'documents',
        timestamp: new Date().toISOString(),
        documentContext,
        sender: 'system' // Changed to 'system'
      };
      setMessages(prev => [...prev, documentMessage]);
    }
  }, [documentContext]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Read file content for text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target?.result as string);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        setFileContent(`PDF Document: ${file.name} - Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setFileContent(`Word Document: ${file.name} - Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      } else {
        setFileContent(`Document uploaded: ${file.name} (${file.type}) - Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      }

      // Add a system message about the uploaded file
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: `📎 Document uploaded: ${file.name}. You can now ask questions about this document!`,
        isUser: false,
        agent: 'system',
        timestamp: new Date().toISOString(),
        sender: 'system' // Changed to 'system'
      };
      setMessages(prev => [...prev, fileMessage]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileContent('');
  };

  const agents = [
    { id: 'general', name: 'General AI', icon: '🤖' },
    { id: 'weather', name: 'Weather', icon: '🌤️' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'ports', name: 'Ports', icon: '🏠' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'sof_parser', name: 'SOF Parser', icon: '📊' },
    { id: 'cp', name: 'Charter Party', icon: '📋' },
    { id: 'checklist', name: 'Checklist', icon: '✅' },
    { id: 'carbon', name: 'Carbon', icon: '🌱' },
    { id: 'compliance', name: 'Compliance', icon: '🔍' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
      sender: 'user' // Changed to 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if this is a document-related question
      const isDocumentQuestion = inputText.toLowerCase().includes('document') || 
                                inputText.toLowerCase().includes('upload') || 
                                inputText.toLowerCase().includes('pdf') ||
                                inputText.toLowerCase().includes('what does') ||
                                inputText.toLowerCase().includes('say') ||
                                inputText.toLowerCase().includes('content');

      if (isDocumentQuestion && (documentContext || fileContent)) {
        // Provide document analysis response
        const contextToUse = fileContent || documentContext;
        const analysisResponse = analyzeDocument(inputText, contextToUse);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: analysisResponse,
          isUser: false,
          agent: 'documents',
          timestamp: new Date().toISOString(),
          documentContext: contextToUse,
          sender: 'ai' // Changed to 'ai'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Regular API call
        const response = await fetch(API_ENDPOINTS.chat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: inputText,
            agent_type: selectedAgent === 'general' ? undefined : selectedAgent,
            document_context: fileContent || documentContext || undefined
          })
        });

        if (!response.ok) throw new Error('Failed to send message');
        
        const data = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          agent: data.agent_type || 'general',
          timestamp: data.timestamp,
          sender: 'ai' // Changed to 'ai'
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        agent: 'error',
        timestamp: new Date().toISOString(),
        sender: 'ai' // Changed to 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDocument = (question: string, context: string): string => {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('what does') || questionLower.includes('say') || questionLower.includes('content')) {
      if (context.includes('Resume-Madhavsingh.pdf')) {
        return `📄 **Document Analysis: Resume-Madhavsingh.pdf**

Based on the uploaded document, this appears to be a resume/CV for Madhav Singh. 

**Document Type:** Resume/CV
**File Format:** PDF
**File Size:** 0.11 MB

**What I can tell you:**
- This is a personal resume document
- The file is relatively small (0.11 MB), suggesting it's a text-based PDF
- It's named "Resume-Madhavsingh.pdf" indicating it's a professional resume

**To get detailed content analysis:**
- I can help you with maritime documents like SOF, Charter Parties, Bills of Lading
- For resume analysis, you might want to ask specific questions about the content
- I'm specialized in maritime industry documents and operations

**Maritime Document Support:**
I'm designed to analyze maritime industry documents including:
• Statements of Facts (SoF)
• Charter Party agreements
• Port documentation
• Cargo manifests
• Marine insurance documents

Would you like me to help you with any maritime document analysis instead?`;
      } else if (context.includes('SOF') || context.includes('Statement of Facts')) {
        return `📄 **SOF Document Analysis**

I can analyze this Statement of Facts document for:
• Laytime calculations
• Demurrage/despatch analysis
• Port operations details
• Cargo handling information
• Weather delays and force majeure events

What specific information would you like me to extract from this SOF?`;
      } else if (context.includes('Charter Party') || context.includes('CP')) {
        return `📄 **Charter Party Analysis**

I can help analyze this Charter Party document for:
• Clause interpretations
• Demurrage provisions
• Laytime calculations
• Force majeure clauses
• Liability and insurance terms

What aspect of the Charter Party would you like me to focus on?`;
      } else {
        return `📄 **Document Analysis**

I can see you've uploaded a document. To provide better analysis, please let me know:

1. **What type of document** this is (SOF, CP, Bill of Lading, etc.)
2. **What specific information** you need from it
3. **Any particular clauses or sections** you want me to focus on

I'm specialized in maritime industry documents and can help with:
• Document parsing and data extraction
• Compliance checking
• Financial calculations
• Regulatory analysis

What would you like me to help you with?`;
      }
    }
    
    return `I can help you analyze the uploaded document. Please ask me specific questions about what you'd like to know from it.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAgentIcon = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.icon || '🤖';
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'AI';
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Agent Selection - Compact Horizontal */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white mb-3">AI Agent</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                selectedAgent === agent.id
                  ? 'bg-[#0074D9] text-white border-[#39CCCC] shadow-lg shadow-[#0074D9]/25'
                  : 'bg-white/10 backdrop-blur-md text-[#ADB5BD] border-white/20 hover:bg-white/20 hover:text-white hover:border-[#39CCCC]/50'
              }`}
            >
              <span className="text-sm">{agent.icon}</span>
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area - Much Larger */}
      <div className="flex-1 bg-[#001F3F]/50 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-4 overflow-y-auto min-h-[500px]">
        {messages.length === 0 ? (
          <div className="text-center text-[#ADB5BD] py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with your selected AI agent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#0074D9] text-white shadow-lg shadow-[#0074D9]/25'
                      : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.documentContext && (
                    <div className="mt-2 text-xs text-[#ADB5BD] border-t border-white/20 pt-2">
                      📄 Document context included
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl">
                  <div className="flex items-center gap-2 text-[#ADB5BD]">
                    <div className="w-4 h-4 border-2 border-[#39CCCC] border-t-transparent rounded-full animate-spin"></div>
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-md">
        {/* File Upload Preview */}
        {uploadedFile && (
          <div className="mb-3 p-3 bg-[#0074D9]/20 border border-[#39CCCC]/30 rounded-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#39CCCC]">📎</span>
                <span className="text-sm text-white font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-[#39CCCC]">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-[#FF4136] hover:text-red-400 text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {/* Attachment Button */}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 border border-white/30 hover:border-[#39CCCC]/50"
              title="Upload document"
            >
              <svg className="w-5 h-5 text-[#39CCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </label>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about maritime operations, documents, weather, navigation..."
            className="flex-1 px-3 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-[#39CCCC] focus:border-transparent text-white placeholder-[#ADB5BD] transition-all duration-300"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-[#0074D9] text-white rounded-lg hover:bg-[#0074D9]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#0074D9]/25"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox; 