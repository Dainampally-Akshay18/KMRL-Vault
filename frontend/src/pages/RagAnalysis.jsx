// RagAnalysis.jsx - Professional Sidebar Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { getSessionId } from '../services/api';
import RiskAnalysis from './RiskAnalysis';
import NegotiationAssistant from './NegotiationAssistant';
import DocumentSummarization from './DocumentSummarization';
import ChatBot from './ChatBot';

const RagAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Handle sidebar collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Dark Theme Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#20B2AA]/20 to-[#81D8D0]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 border-4 border-[#20B2AA]/30 border-t-[#20B2AA] rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Analysis Tools</h2>
            <p className="text-slate-400">Preparing your document analysis interface...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Dark Theme Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-lg mx-auto text-center">
            <div className="text-6xl mb-6">⚠</div>
            <h2 className="text-2xl font-bold text-white mb-4">Analysis Error</h2>
            <p className="text-red-300 mb-8 leading-relaxed">{error}</p>
            <button 
              className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#20B2AA]/50"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Dark UI Theme Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Analysis-themed animated orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#20B2AA]/20 to-[#81D8D0]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-10 right-20 w-32 h-32 border border-[#20B2AA]/20 rounded-3xl rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-[#81D8D0]/20 rounded-full animate-pulse"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl z-50 transition-all duration-500 ${
        sidebarCollapsed ? 'w-20' : 'w-80'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-2xl flex items-center justify-center text-2xl shadow-2xl shadow-[#20B2AA]/30">
                📊
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                    KMRL-Vault
                  </h1>
                  <p className="text-slate-400 text-sm">Analysis Dashboard</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Document Info */}
        {documentInfo && (
          <div className="p-6 border-b border-slate-700/50">
            {!sidebarCollapsed ? (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-5">
                <h3 className="text-[#20B2AA] font-bold mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#20B2AA]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  Current Document
                </h3>
                <div className="space-y-2">
                  <p className="text-white font-semibold text-sm truncate">{documentInfo.document_name}</p>
                  <p className="text-green-400 font-semibold text-sm">✓ Ready for Analysis</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#20B2AA]/20 to-[#81D8D0]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#20B2AA]" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-6">
          <div className="space-y-4">
            {[
              { 
                to: '/analysis/risk-analysis', 
                icon: '⚠', 
                label: 'Risk Analysis',
                description: 'Identify potential legal risks',
                gradient: 'from-red-500 to-orange-500'
              },
              { 
                to: '/analysis/document-summary', 
                icon: '📋', 
                label: 'Document Summary',
                description: 'AI-powered comprehensive analysis',
                gradient: 'from-[#20B2AA] to-[#81D8D0]'
              },
              { 
                to: '/analysis/chatbot',
                icon: '🤖', 
                label: 'Chat Assistant',
                description: 'Interactive Q&A with AI',
                gradient: 'from-blue-500 to-purple-500'
              }
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl shadow-current/30 scale-105`
                      : 'bg-slate-900/60 border border-slate-600/50 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-500/70 hover:shadow-2xl'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`
                }
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                  location.pathname === item.to 
                    ? 'bg-white/20' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                }`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <div className="font-bold text-base">{item.label}</div>
                    <div className="text-sm opacity-80 mt-1">{item.description}</div>
                  </div>
                )}
                
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  location.pathname === item.to 
                    ? 'bg-white scale-125' 
                    : `bg-current opacity-0 ${!sidebarCollapsed ? 'group-hover:opacity-100 group-hover:scale-100' : ''}`
                }`}></div>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700/50">
          <div className={`space-y-3 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            <button 
              className={`flex items-center gap-3 w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white rounded-xl transition-all duration-300 hover:scale-105 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              onClick={() => navigate('/document-upload')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {!sidebarCollapsed && <span>Back to Upload</span>}
            </button>
            
            <button 
              className={`flex items-center gap-3 w-full p-3 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#20B2AA]/30 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              onClick={() => navigate('/')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {!sidebarCollapsed && <span>Home</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
        {/* Top Header Bar */}
        <header className="bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-40 shadow-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                  Document Analysis Dashboard
                </h1>
                <p className="text-slate-400 text-lg mt-2">
                  Comprehensive AI-powered analysis tools for your legal documents
                </p>
              </div>
              
              {/* Current Page Indicator */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">
                    {location.pathname.includes('risk-analysis') && 'Risk Analysis'}
                    {location.pathname.includes('document-summary') && 'Document Summary'}
                    {location.pathname.includes('chatbot') && 'Chat Assistant'}
                    {location.pathname.includes('negotiation-assistant') && 'Negotiation Assistant'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 min-h-screen">
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
            <Route 
              path="/chatbot" 
              element={<ChatBot documentInfo={documentInfo} />} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default RagAnalysis;
