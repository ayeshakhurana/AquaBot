import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  agent?: string;
  timestamp: string;
}

interface ChatBoxProps {
  className?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Maritime AI Assistant. I can help with weather, navigation, documents, laytime calculations, and more. What would you like to know?',
      isUser: false,
      agent: 'general',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          agent_type: selectedAgent === 'general' ? undefined : selectedAgent
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        agent: data.agent_type || 'general',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        agent: 'error',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
    <div className={`flex flex-col h-full ${className}`}>
      {/* Agent Selector */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedAgent === agent.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="mr-1">{agent.icon}</span>
            {agent.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {!message.isUser && message.agent && message.agent !== 'general' && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <span>{getAgentIcon(message.agent)}</span>
                  <span>{getAgentName(message.agent)}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.text}</div>
              <div className="text-xs mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about maritime operations, weather, navigation, or upload documents..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox; 