import React, { useState, useEffect, useRef } from 'react';
import { getSessionId, chatbot } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ChatBot = ({ documentInfo }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // State management
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId, setConversationId] = useState('');

  // Initialize component
  useEffect(() => {
    const initializeChatBot = async () => {
      try {
        const sessionIdValue = getSessionId();
        if (!sessionIdValue) {
          setError('No session found. Please refresh the page.');
          return;
        }
        setSessionId(sessionIdValue);

        if (!documentInfo) {
          setError('No document loaded. Please upload a document first.');
          return;
        }

        // Load default suggestions (no API call needed)
        setSuggestions([
          "What are the key terms in this document?",
          "What are the main obligations mentioned?",
          "Are there any risks I should know about?",
          "What are the payment terms?",
          "What are the termination conditions?",
          "Can you summarize the main clauses?"
        ]);

        // Add welcome message
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: `Hello! I'm your KMRL Legal Assistant. I can help you analyze and understand your document "${documentInfo.document_name}". Feel free to ask me anything about the content, terms, clauses, or legal implications.`,
          timestamp: new Date().toISOString(),
          sources: []
        }]);

      } catch (err) {
        console.error('❌ ChatBot initialization error:', err);
        setError('Failed to initialize chat assistant.');
      }
    };

    initializeChatBot();
  }, [documentInfo]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message to chatbot (simplified without JWT token)
  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      // Use existing analysis APIs as fallback for now
      // This simulates chatbot responses using your existing backend
      const response = await simulateChatResponse(messageText, documentInfo.document_id);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          sources: response.sources || [],
          confidence_score: response.confidence_score || 0.85
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(response.conversation_id || `conv_${Date.now()}`);
      } else {
        throw new Error(response.error || 'Chat response failed');
      }

    } catch (err) {
      console.error('❌ Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, but I encountered an error while processing your question. Please try rephrasing your question or check if the document is properly loaded. Error: ${err.message}`,
        timestamp: new Date().toISOString(),
        sources: [],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate chat response using existing analysis APIs
  const simulateChatResponse = async (question, documentId) => {
    try {
      // Import your existing API functions
      const { runRiskAnalysis, runDocumentSummary, runNegotiationAssistant } = await import('../services/api');
      
      // Determine which analysis to run based on question content
      let response;
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes('risk') || questionLower.includes('danger') || questionLower.includes('problem')) {
        response = await runRiskAnalysis(documentId);
        if (response.success) {
          return {
            success: true,
            response: `Based on my analysis of your document, here are the key risks identified:\n\n${formatAnalysisResponse(response.data, 'risk')}`,
            sources: [{ text_preview: "Risk analysis performed on entire document", chunk_index: 0, relevance_score: 0.9 }],
            confidence_score: 0.9,
            conversation_id: `conv_risk_${Date.now()}`
          };
        }
      } else if (questionLower.includes('summary') || questionLower.includes('summarize') || questionLower.includes('overview')) {
        response = await runDocumentSummary(documentId);
        if (response.success) {
          return {
            success: true,
            response: `Here's a comprehensive summary of your document:\n\n${formatAnalysisResponse(response.data, 'summary')}`,
            sources: [{ text_preview: "Document summary generated from full content", chunk_index: 0, relevance_score: 0.95 }],
            confidence_score: 0.95,
            conversation_id: `conv_summary_${Date.now()}`
          };
        }
      } else if (questionLower.includes('negotiat') || questionLower.includes('terms') || questionLower.includes('clause')) {
        response = await runNegotiationAssistant(documentId);
        if (response.success) {
          return {
            success: true,
            response: `Here's my analysis regarding negotiation and terms:\n\n${formatAnalysisResponse(response.data, 'negotiation')}`,
            sources: [{ text_preview: "Negotiation analysis based on document terms", chunk_index: 0, relevance_score: 0.88 }],
            confidence_score: 0.88,
            conversation_id: `conv_negotiation_${Date.now()}`
          };
        }
      } else {
        // General response - try document summary as default
        response = await runDocumentSummary(documentId);
        if (response.success) {
          return {
            success: true,
            response: `I understand you're asking about "${question}". While I don't have specific chatbot functionality yet, here's some relevant information from your document:\n\n${formatAnalysisResponse(response.data, 'general')}`,
            sources: [{ text_preview: "General document analysis", chunk_index: 0, relevance_score: 0.75 }],
            confidence_score: 0.75,
            conversation_id: `conv_general_${Date.now()}`
          };
        }
      }

      // Fallback response
      return {
        success: true,
        response: `Thank you for your question: "${question}". I'm currently being enhanced to provide better conversational responses. For now, I can help you with:\n\n• Risk Analysis - Ask about potential risks\n• Document Summary - Ask for an overview\n• Negotiation Guidance - Ask about terms and clauses\n\nPlease try rephrasing your question using one of these topics.`,
        sources: [],
        confidence_score: 0.6,
        conversation_id: `conv_fallback_${Date.now()}`
      };

    } catch (error) {
      console.error('❌ Simulated chat response error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate response'
      };
    }
  };

  // Format analysis response for chat display
  const formatAnalysisResponse = (data, type) => {
    if (!data) return "No analysis data available.";
    
    try {
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.analysis || data.summary || data.result) {
        return data.analysis || data.summary || data.result;
      }
      
      // Handle structured data
      if (data.risks && Array.isArray(data.risks)) {
        return data.risks.map((risk, index) => `${index + 1}. ${risk.description || risk}`).join('\n');
      }
      
      if (data.key_points && Array.isArray(data.key_points)) {
        return data.key_points.map((point, index) => `• ${point}`).join('\n');
      }
      
      return JSON.stringify(data, null, 2);
      
    } catch (error) {
      console.error('❌ Error formatting response:', error);
      return "Analysis completed successfully, but there was an issue formatting the response.";
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: `Conversation cleared. How can I help you analyze "${documentInfo.document_name}"?`,
      timestamp: new Date().toISOString(),
      sources: []
    }]);
    setShowSuggestions(true);
    setError('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-lg text-center">
          <div className="text-4xl mb-4">🤖❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">ChatBot Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/70 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🤖</div>
          <div>
            <h2 className="text-xl font-bold">KMRL Legal Assistant</h2>
            <p className="text-sm opacity-90">
              Analyzing: {documentInfo?.document_name || 'Legal Document'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Online
          </div>
          <button
            onClick={clearConversation}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-10 h-10 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                🤖
              </div>
            )}
            
            <div className={`max-w-[70%] ${message.role === 'user' ? 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white' : message.isError ? 'bg-red-50 border border-red-200' : 'bg-white border border-[#81D8D0]/30'} rounded-xl p-4 shadow-sm`}>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">📚 Analysis Source:</p>
                  <div className="space-y-2">
                    {message.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded-lg text-xs">
                        <div className="text-gray-700 italic">
                          "{source.text_preview}"
                        </div>
                        <div className="text-gray-500 mt-1">
                          Confidence: {Math.round(source.relevance_score * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Message metadata */}
              <div className="flex items-center justify-between mt-3 text-xs opacity-70">
                <span>{formatTime(message.timestamp)}</span>
                {message.confidence_score && (
                  <span>Confidence: {Math.round(message.confidence_score * 100)}%</span>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                👤
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-white">
              🤖
            </div>
            <div className="bg-white border border-[#81D8D0]/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 text-sm">Analyzing document...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-6 py-4 border-t border-[#81D8D0]/30">
          <p className="text-sm font-semibold text-gray-700 mb-3">💡 Suggested questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 bg-[#CCFFEB]/50 hover:bg-[#CCFFEB] border border-[#81D8D0]/30 hover:border-[#20B2AA]/50 rounded-lg text-sm transition-all duration-200 hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-[#81D8D0]/30 bg-white/50">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your document..."
              className="w-full p-4 pr-12 border border-[#81D8D0]/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#20B2AA]/50 focus:border-[#20B2AA]/50 transition-all duration-200 bg-white/70 backdrop-blur-sm"
              rows="3"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Send
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
