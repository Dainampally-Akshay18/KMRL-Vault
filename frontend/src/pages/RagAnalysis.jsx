import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { getSessionId } from '../services/api';
import RiskAnalysis from './RiskAnalysis';
import NegotiationAssistant from './NegotiationAssistant';
import DocumentSummarization from './DocumentSummarization';
import ChatBot from './ChatBot'; // ✅ ADD THIS IMPORT

const RagAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const sessionIdValue = getSessionId();
        if (!sessionIdValue) {
          setError('No session found. Please refresh the page.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        setSessionId(sessionIdValue);

        const docData = localStorage.getItem('current_document');
        if (docData) {
          const parsedDocData = JSON.parse(docData);
          setDocumentInfo(parsedDocData);
          console.log('📄 Document loaded:', parsedDocData);
        } else {
          setError('No document found. Please upload a document first.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
      } catch (err) {
        console.error('❌ Initialization error:', err);
        setError('Failed to initialize analysis page.');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [navigate]);

  // Auto-redirect to risk analysis if on base analysis page
  useEffect(() => {
    if (location.pathname === '/analysis' || location.pathname === '/analysis/') {
      navigate('/analysis/risk-analysis', { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#CCFFEB] via-[#EAD2AC] to-[#CCFFEB] flex items-center justify-center overflow-x-hidden">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 border-4 border-[#81D8D0]/30 border-t-[#20B2AA] rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Analysis Tools</h2>
          <p className="text-gray-600">Preparing your document analysis interface...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#CCFFEB] via-[#EAD2AC] to-[#CCFFEB] flex items-center justify-center p-4 overflow-x-hidden">
        <div className="bg-white/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Error</h2>
          <p className="text-red-600 mb-8 leading-relaxed">{error}</p>
          <button 
            className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => navigate('/')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Back to Home
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#CCFFEB] via-[#EAD2AC] to-[#CCFFEB] text-gray-800 flex flex-col overflow-x-hidden">
      {/* Header Section - Full Width */}
      <br /><br /><br />
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-[#81D8D0]/30 sticky top-0 z-40">
        <div className="w-full px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 max-w-none">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                  Document Analysis Dashboard
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Comprehensive analysis tools for your legal documents
                </p>
              </div>
            </div>

            {/* Document Info */}
            {documentInfo && (
              <div className="bg-[#CCFFEB]/60 backdrop-blur-sm border border-[#81D8D0]/50 rounded-xl p-4 min-w-80">
                <h3 className="text-[#20B2AA] font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Current Document
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-800 font-medium truncate ml-2 max-w-48">{documentInfo.document_name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Full Width */}
      <nav className="w-full bg-white/60 backdrop-blur-sm border-b border-[#81D8D0]/30 sticky top-24 z-30">
        <div className="w-full px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center max-w-none">
            {[
              { 
                to: '/analysis/risk-analysis', 
                icon: '🔍', 
                label: 'Risk Analysis',
                description: 'Identify potential risks'
              },
              { 
                to: '/analysis/document-summary', 
                icon: '📄', 
                label: 'Document Summary',
                description: 'AI-powered summarization'
              },
              { 
                to: '/analysis/negotiation-assistant', 
                icon: '🤝', 
                label: 'Negotiation Assistant',
                description: 'Strategic guidance'
              },
              { 
                to: '/analysis/chatbot', // ✅ FIXED: Changed route to chatbot
                icon: '🤖', // ✅ FIXED: Changed icon to robot
                label: 'Chat Bot',
                description: 'Interactive Q&A assistant' // ✅ FIXED: Updated description
              }
            ].map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 min-w-60 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white shadow-2xl shadow-[#20B2AA]/50 scale-105'
                      : 'bg-white/60 border border-[#81D8D0]/30 text-gray-700 hover:bg-[#81D8D0]/20 hover:text-gray-800 hover:scale-105 hover:shadow-xl hover:border-[#20B2AA]/50'
                  }`
                }
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-base">{tab.label}</div>
                  <div className="text-xs opacity-80">{tab.description}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Full Width */}
      <main className="flex-1 w-full px-4 py-8 overflow-x-hidden">
        <div className="w-full max-w-none">
          <Routes>
            <Route 
              path="/risk-analysis" 
              element={<RiskAnalysis documentInfo={documentInfo} />} 
            />
            <Route 
              path="/document-summary" 
              element={<DocumentSummarization documentInfo={documentInfo} />} 
            />
            <Route 
              path="/negotiation-assistant" 
              element={<NegotiationAssistant documentInfo={documentInfo} />} 
            />
            {/* ✅ ADD THIS NEW ROUTE FOR CHATBOT */}
            <Route 
              path="/chatbot" 
              element={<ChatBot documentInfo={documentInfo} />} 
            />
          </Routes>
        </div>
      </main>

      {/* Footer - Full Width */}
      <footer className="w-full bg-white/60 border-t border-[#81D8D0]/30 mt-auto">
        <div className="w-full px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-none">
            <p className="text-gray-600 text-sm">
              Powered by KMRL-Vault • Advanced Legal Document Analysis
            </p>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[#CCFFEB]/50 hover:bg-[#81D8D0]/20 border border-[#81D8D0]/50 hover:border-[#20B2AA]/50 text-gray-700 hover:text-gray-800 rounded-lg transition-all duration-300"
              onClick={() => navigate('/')}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Back to Upload
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RagAnalysis;