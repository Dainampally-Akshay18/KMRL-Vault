// ChatBot.jsx - Dark UI Theme with Mobile Responsive Design
import React, { useState, useEffect, useRef } from 'react';
import { getSessionId, chatbot } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const ChatBot = ({ documentInfo }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State management - simplified without tokens
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId, setConversationId] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

        console.log('🚀 Initializing ChatBot for document:', documentInfo.document_name);

        // Initialize chatbot with document - NO TOKENS
        const initResult = await chatbot.initialize(documentInfo.document_id);
        
        if (initResult.success) {
          setSuggestions(initResult.suggestions);
          
          // Add welcome message with markdown
          setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: `# Hello! I'm your KMRL Legal Assistant 👋

I can help you analyze and understand your document **"${documentInfo.document_name}"**. 

## What I can do:
- 📋 **Contract Analysis** - Analyze terms, conditions, and clauses
- ⚖️ **Risk Assessment** - Identify potential legal risks and liabilities  
- 🔍 **Clause Explanation** - Explain complex legal terminology
- 💼 **Compliance Guidance** - Check regulatory requirements
- 🤝 **Negotiation Support** - Suggest improvements and alternatives

Feel free to ask me anything about the content, terms, clauses, or legal implications!`,
            timestamp: new Date().toISOString(),
            sources: []
          }]);
          
          console.log('✅ ChatBot initialized successfully');
        } else {
          throw new Error(initResult.error || 'Failed to initialize chatbot');
        }

      } catch (err) {
        console.error('❌ ChatBot initialization error:', err);
        setError(`Failed to initialize chat assistant: ${err.message}`);
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

  // Enhanced response parsing for better markdown formatting
  const parseAndFormatResponse = (rawResponse) => {
    // If response is already well-formatted, return as is
    if (rawResponse.includes('#') || rawResponse.includes('**') || rawResponse.includes('*')) {
      return rawResponse;
    }

    // Try to parse structured response (like your example)
    try {
      if (rawResponse.startsWith('{') && rawResponse.includes('person_involved')) {
        const parsed = JSON.parse(rawResponse.replace(/'/g, '"'));
        
        let formattedResponse = '';
        
        // Person Involved
        if (parsed.person_involved) {
          formattedResponse += `## 👤 Person Involved\n**${parsed.person_involved}**\n\n`;
        }
        
        // Description
        if (parsed.description) {
          formattedResponse += `## 📋 Description\n${parsed.description}\n\n`;
        }
        
        // Reference
        if (parsed.reference) {
          formattedResponse += `## 📍 Reference\n*${parsed.reference}*\n\n`;
        }
        
        // Legal Implications
        if (parsed.legalImplications) {
          formattedResponse += `## ⚖️ Legal Implications\n${parsed.legalImplications}\n\n`;
        }
        
        // Related Questions
        if (parsed.relatedQuestions && Array.isArray(parsed.relatedQuestions)) {
          formattedResponse += `## 🤔 Related Questions\n`;
          parsed.relatedQuestions.forEach((question, index) => {
            formattedResponse += `${index + 1}. ${question}\n`;
          });
          formattedResponse += '\n';
        }
        
        // Note
        if (parsed.note) {
          formattedResponse += `## 📝 Note\n${parsed.note}\n`;
        }
        
        return formattedResponse;
      }
    } catch (e) {
      console.log('Response is not structured JSON, treating as plain text');
    }

    // For plain text responses, add basic formatting
    return rawResponse
      .replace(/(\d+\.)/g, '\n$1') // Add line breaks before numbered lists
      .replace(/([A-Z][A-Z\s]+:)/g, '\n**$1**') // Make ALL CAPS headers bold
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple line breaks
      .trim();
  };

  // Send message to chatbot
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
      console.log('💬 Sending message to chatbot:', messageText);

      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Send message using the chatbot service - NO TOKENS
      const response = await chatbot.chat(
        documentInfo.document_id,
        messageText,
        conversationHistory
      );

      if (response.success) {
        // Parse and format the response for better display
        const formattedContent = parseAndFormatResponse(response.data);
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: formattedContent,
          timestamp: new Date().toISOString(),
          sources: response.sources || [],
          confidence_score: response.confidence_score || 0.85,
          context_used: response.context_used || 0
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(response.conversation_id || `conv_${Date.now()}`);
        
        console.log('✅ Chatbot response received successfully');
      } else {
        throw new Error(response.error || 'Chat response failed');
      }

    } catch (err) {
      console.error('❌ Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `## ❌ Error Occurred

I apologize, but I encountered an error while processing your question. 

**Error Details:** ${err.message}

### 🔄 Troubleshooting Steps:
1. **Try rephrasing your question** - Sometimes different wording helps
2. **Check document status** - Ensure your document is properly loaded
3. **Refresh the page** - This can resolve temporary connection issues
4. **Try a simpler question first** - Start with basic queries about the document

### 💡 Suggested Questions:
- "What is this document about?"
- "Who are the parties involved?"
- "What are the key terms?"`,
        timestamp: new Date().toISOString(),
        sources: [],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
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
      content: `# Conversation Cleared 🔄

How can I help you analyze **"${documentInfo.document_name}"**?

Feel free to ask me about:
- Contract terms and conditions
- Legal obligations and responsibilities  
- Risk analysis and implications
- Compliance requirements
- Specific clauses or sections`,
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

  // Custom markdown components for dark theme
  const markdownComponents = {
    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 border-b border-slate-600 pb-2">{children}</h1>,
    h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3 mt-4">{children}</h2>,
    h3: ({children}) => <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-3">{children}</h3>,
    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
    strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
    em: ({children}) => <em className="italic text-slate-400">{children}</em>,
    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-300">{children}</ul>,
    ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-300">{children}</ol>,
    li: ({children}) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-[#20B2AA] pl-4 py-2 my-3 bg-slate-800/50 italic text-slate-300">
        {children}
      </blockquote>
    ),
    code: ({children}) => (
      <code className="bg-slate-700 px-2 py-1 rounded text-sm font-mono text-slate-200">
        {children}
      </code>
    ),
  };

  if (error && !messages.length) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-lg text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-white mb-4">ChatBot Error</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-800/60 backdrop-blur-2xl border border-slate-600/50 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      {/* Chat Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
            🤖
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">KMRL Legal Assistant</h2>
            <p className="text-xs sm:text-sm opacity-90 truncate">
              {isMobile ? `"${documentInfo?.document_name?.slice(0, 20)}..."` : `Analyzing "${documentInfo?.document_name}" Legal Document`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-sm opacity-90">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Online
          </div>
          <button
            onClick={clearConversation}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages - Mobile Responsive */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
                🤖
              </div>
            )}
            
            <div className={`max-w-[85%] sm:max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white' 
                : message.isError 
                  ? 'bg-red-900/40 border border-red-500/50' 
                  : 'bg-slate-900/60 border border-slate-600/50'
            } rounded-xl shadow-lg overflow-hidden backdrop-blur-xl`}>
              
              {/* Message Content */}
              <div className="p-3 sm:p-4">
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-white text-sm sm:text-base">
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Sources Section - Enhanced for Mobile */}
              {message.sources && message.sources.length > 0 && (
                <div className="border-t border-slate-700 bg-slate-800/50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-[#20B2AA]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-slate-300">Analysis Sources ({message.sources.length})</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {message.sources.slice(0, isMobile ? 2 : 3).map((source, index) => (
                      <div key={index} className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-[#20B2AA] uppercase tracking-wide">
                            Section {source.chunk_index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-400">
                              {Math.round(source.relevance_score * 100)}%
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              source.relevance_score > 0.8 ? 'bg-green-400' :
                              source.relevance_score > 0.6 ? 'bg-yellow-400' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                          "{source.text_preview}"
                        </div>
                        {source.word_count && !isMobile && (
                          <div className="text-xs text-slate-500 mt-2">
                            {source.word_count} words • {source.character_count} characters
                          </div>
                        )}
                      </div>
                    ))}
                    {message.sources.length > (isMobile ? 2 : 3) && (
                      <div className="text-center">
                        <span className="text-xs text-slate-500">
                          +{message.sources.length - (isMobile ? 2 : 3)} more sources referenced
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message Metadata - Simplified for Mobile */}
              <div className="px-3 sm:px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatTime(message.timestamp)}</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {message.confidence_score && !isMobile && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        {Math.round(message.confidence_score * 100)}%
                      </span>
                    )}
                    {message.context_used > 0 && (
                      <span>{message.context_used} sources</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-600 rounded-full flex items-center justify-center text-slate-300 font-bold flex-shrink-0 mt-1">
                👤
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator - Mobile Responsive */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-white mt-1">
              🤖
            </div>
            <div className="bg-slate-900/60 border border-slate-600/50 rounded-xl p-3 sm:p-4 max-w-[85%] sm:max-w-[80%] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-slate-300 text-xs sm:text-sm font-medium">
                  {isMobile ? 'Analyzing...' : 'Analyzing document and generating response...'}
                </span>
              </div>
              {!isMobile && (
                <div className="mt-2 text-xs text-slate-500">
                  Using AI to search through {documentInfo?.document_name}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions - Mobile Responsive */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-600/50 bg-slate-800/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#20B2AA]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-slate-300">Suggested Questions</span>
          </div>
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-2`}>
            {suggestions.slice(0, isMobile ? 3 : suggestions.length).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-[#20B2AA]/50 rounded-lg text-xs sm:text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#20B2AA] mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                    {suggestion}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Mobile Responsive */}
      <div className="p-4 sm:p-6 border-t border-slate-600/50 bg-slate-800/40 backdrop-blur-xl">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isMobile ? "Ask about your document..." : "Ask me anything about your document..."}
              className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border border-slate-600/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#20B2AA]/50 focus:border-[#20B2AA]/50 transition-all duration-200 bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 text-sm sm:text-base"
              rows={isMobile ? 2 : 3}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-slate-500">
              {isMobile ? 'Enter' : 'Press Enter to send'}
            </div>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:transform-none flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {!isMobile && <span>Send</span>}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
