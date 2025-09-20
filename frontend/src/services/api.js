// api.js - Simplified chatbot functions without document tokens

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'access_token';

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      try {
        await createSession();
        const originalRequest = error.config;
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (sessionError) {
        console.error('Failed to create new session:', sessionError);
      }
    }
    return Promise.reject(error);
  }
);

// Session management - same as your existing code
export const createSession = async () => {
  try {
    console.log('🔄 Creating new session...');
    const response = await api.post('/auth/create-session', {
      client_info: 'web_client'
    });
    
    const { access_token, session_id } = response.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem('session_id', session_id);
    console.log('✅ Session created successfully');
    return { access_token, session_id };
  } catch (error) {
    console.error('❌ Create session error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create session');
  }
};

export const getSessionToken = () => localStorage.getItem(TOKEN_KEY);
export const getSessionId = () => localStorage.getItem('session_id');

// Document management - same as your existing analysis.py pattern
export const storeDocumentChunks = async (documentData) => {
  try {
    console.log('📄 Storing document chunks...');
    const response = await api.post('/documents/store-chunks', documentData);
    console.log('✅ Document chunks stored successfully');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Store chunks error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to store document' 
    };
  }
};

// Analysis API calls - same as existing
export const runRiskAnalysis = async (documentId, jurisdiction = 'US') => {
  try {
    console.log(`🔍 Running risk analysis for document ${documentId}`);
    const response = await api.post('/analysis/risk-analysis', {
      document_id: documentId,
      jurisdiction
    });
    console.log('✅ Risk analysis completed');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Risk analysis error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || 'Risk analysis failed' 
    };
  }
};

export const runNegotiationAssistant = async (documentId, jurisdiction = 'US') => {
  try {
    console.log(`🤝 Running negotiation assistant for document ${documentId}`);
    const response = await api.post('/analysis/negotiation-assistant', {
      document_id: documentId,
      jurisdiction
    });
    console.log('✅ Negotiation assistant completed');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Negotiation assistant error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || 'Negotiation assistance failed' 
    };
  }
};

export const runDocumentSummary = async (documentId, jurisdiction = 'US') => {
  try {
    console.log(`📋 Running document summary for document ${documentId}`);
    const response = await api.post('/analysis/document-summary', {
      document_id: documentId,
      jurisdiction
    });
    console.log('✅ Document summary completed');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Document summary error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || 'Document summary failed' 
    };
  }
};

// CHATBOT API FUNCTIONS - SIMPLIFIED (No Document Tokens)
export const chatWithDocument = async (messageData) => {
  try {
    console.log(`💬 Sending message to chatbot for document ${messageData.document_id}`);
    console.log(`📝 Message: ${messageData.message.substring(0, 50)}...`);
    
    const response = await api.post('/chatbot/chat', messageData);
    console.log('✅ Chatbot response received');
    
    return {
      success: true,
      data: response.data.response,
      sources: response.data.sources || [],
      conversation_id: response.data.conversation_id,
      timestamp: response.data.timestamp,
      context_used: response.data.context_used,
      model_used: response.data.model_used,
      confidence_score: response.data.confidence_score
    };
  } catch (error) {
    console.error('❌ Chatbot conversation error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || 'Chat request failed' 
    };
  }
};

// Get intelligent chat suggestions - simplified
export const getChatSuggestions = async (documentId) => {
  try {
    console.log(`💡 Getting chat suggestions for document ${documentId}`);
    const response = await api.get(`/chatbot/suggestions/${documentId}`);
    console.log('✅ Chat suggestions received');
    
    return {
      success: true,
      suggestions: response.data.suggested_questions || [],
      category: response.data.category
    };
  } catch (error) {
    console.error('❌ Chat suggestions error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get chat suggestions',
      suggestions: [
        'What are the key terms in this document?',
        'What are the main obligations?',
        'Are there any risks I should know about?',
        'What are the payment terms?',
        'What are the termination conditions?'
      ]
    };
  }
};

// Explain specific legal clause - simplified
export const explainLegalClause = async (clauseText, documentId) => {
  try {
    console.log(`📖 Explaining legal clause for document ${documentId}`);
    
    const response = await api.post('/chatbot/explain-clause', {
      clause_text: clauseText,
      document_id: documentId
    });
    
    console.log('✅ Legal clause explanation received');
    return {
      success: true,
      explanation: response.data.clause_explanation,
      analysis_type: response.data.analysis_type,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('❌ Legal clause explanation error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Failed to explain legal clause' 
    };
  }
};

// Get chatbot health status - simplified
export const getChatbotHealth = async () => {
  try {
    console.log('🏥 Checking chatbot health...');
    const response = await api.get('/chatbot/health');
    console.log('✅ Chatbot health check completed');
    
    return {
      success: true,
      health: response.data,
      status: response.data.status,
      features: response.data.features,
      capabilities: response.data.capabilities
    };
  } catch (error) {
    console.error('❌ Chatbot health check error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Chatbot health check failed',
      status: 'unknown'
    };
  }
};

// CHATBOT WRAPPER CLASS - SIMPLIFIED
export const chatbot = {
  // Initialize chatbot with document - no tokens needed
  async initialize(documentId) {
    const suggestionsResult = await getChatSuggestions(documentId);
    return {
      success: true,
      suggestions: suggestionsResult.suggestions || []
    };
  },

  // Send a message - no tokens needed
  async chat(documentId, message, conversationHistory = []) {
    return await chatWithDocument({
      message,
      document_id: documentId,
      conversation_history: conversationHistory,
      max_context_chunks: 8,
      include_document_context: true
    });
  },

  // Explain clause - no tokens needed
  async explainClause(documentId, clauseText) {
    return await explainLegalClause(clauseText, documentId);
  },

  // Get suggestions - no tokens needed
  async getSuggestions(documentId) {
    return await getChatSuggestions(documentId);
  },

  // Health check
  async health() {
    return await getChatbotHealth();
  }
};

export default api;
