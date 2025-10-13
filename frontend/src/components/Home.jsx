// Home.jsx - Fixed OR button overlap with cleaner UI
import logoImage from '../assets/logo.png';
import mapImage from '../assets/map.png';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, getSessionToken, getSessionId } from '../services/api';

const Home = () => {
  // All your existing state management
  const [sessionToken, setSessionToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Configuration
  const getApiBaseUrl = () => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.REACT_APP_API_BASE_URL || 'https://kmrl-vault-1.onrender.com/api/v1';
    }
    if (window.REACT_APP_API_BASE_URL) {
      return window.REACT_APP_API_BASE_URL;
    }
    return 'http://127.0.0.1:8000/api/v1';
  };

  const API_BASE_URL = getApiBaseUrl();
  const SUPPORTED_FORMATS = ['.pdf', '.txt', '.doc', '.docx'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // All your existing functions remain exactly the same...
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = useCallback(async () => {
    try {
      let token = getSessionToken();
      let sessionIdValue = getSessionId();

      if (!token || !sessionIdValue) {
        const sessionData = await createSession();
        token = sessionData.access_token;
        sessionIdValue = sessionData.session_id;
      }

      setSessionToken(token);
      setSessionId(sessionIdValue);
    } catch (err) {
      setError('Failed to initialize session. Please refresh the page.');
    }
  }, []);

  const validateFile = useCallback((file) => {
    const errors = [];
    if (!file) {
      errors.push('No file selected');
      return errors;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    const fileName = file.name.toLowerCase();
    const isValidType = SUPPORTED_FORMATS.some(format => fileName.endsWith(format));
    if (!isValidType) {
      errors.push(`Unsupported file type. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
    }
    if (file.size === 0) {
      errors.push('File appears to be empty');
    }
    return errors;
  }, []);

  const processDocument = useCallback(async () => {
    if (!selectedFile || !sessionToken) {
      setError('Please select a file and ensure session is active');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setUploadProgress(0);

      const isPDF = selectedFile.name.toLowerCase().endsWith('.pdf');

      if (isPDF) {
        setProcessingStage('🔍 Analyzing PDF with AI-powered extraction...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch(`${API_BASE_URL}/documents/upload-pdf`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${sessionToken}` },
          body: formData
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error(`PDF upload failed: ${await response.text()}`);
        }

        const result = await response.json();
        setProcessingResult({
          documentId: result.document_id,
          sessionDocumentId: result.session_document_id,
          chunksStored: result.chunks_stored,
          extractionInfo: result.extraction_info,
          documentSize: selectedFile.size,
          processingTime: Date.now(),
          processingMode: 'enhanced_pdf_processing'
        });

        setSuccess(true);
        setProcessingStage(`✅ PDF processed successfully! Quality: ${result.extraction_info.quality_score.toFixed(1)}/10`);

      } else {
        setProcessingStage('📝 Processing text document...');
        const fileContent = await readFileAsText(selectedFile);

        const textData = {
          document_id: `doc_${selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          full_text: fileContent,
          chunk_size: 500,
          overlap: 100,
          document_type: 'text'
        };

        const response = await fetch(`${API_BASE_URL}/documents/store_chunks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(textData)
        });

        if (!response.ok) {
          throw new Error(`Text processing failed: ${await response.text()}`);
        }

        const result = await response.json();
        setProcessingResult({
          documentId: result.document_id,
          sessionDocumentId: result.session_document_id,
          chunksStored: result.chunks_stored,
          extractionInfo: { method: 'text_input', quality_score: 10.0 },
          documentSize: selectedFile.size,
          processingTime: Date.now(),
          processingMode: 'text_processing'
        });

        setSuccess(true);
        setProcessingStage(`✅ Text document processed successfully! ${result.chunks_stored} chunks created`);
      }

    } catch (error) {
      setError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, sessionToken, API_BASE_URL]);

  const readFileAsText = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((file) => {
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    setSelectedFile(file);
    setError('');
    setSuccess(false);
    setProcessingResult(null);
  }, [validateFile]);

  const handleFileInput = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const navigateToAnalysis = useCallback(() => {
    if (processingResult) {
      localStorage.setItem('current_document', JSON.stringify({
        document_id: processingResult.documentId,
        document_name: selectedFile?.name,
        chunks_count: processingResult.chunksStored,
        processed_at: processingResult.processingTime,
        extraction_info: processingResult.extractionInfo,
        processing_mode: processingResult.processingMode
      }));
      navigate('/analysis');
    }
  }, [processingResult, selectedFile, navigate]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#20B2AA]/40 to-[#81D8D0]/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-80 h-80 bg-gradient-to-r from-[#20B2AA]/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/30 to-[#20B2AA]/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-[#20B2AA]/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#20B2AA] rounded-full animate-ping opacity-70"></div>
          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-1000 opacity-60"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-2000 opacity-50"></div>
          <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-[#20B2AA] rounded-full animate-ping delay-3000 opacity-40"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with Enhanced Glassomorphism */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left Side: Content Container WITHOUT Glass Background */}
              <div className="space-y-8">
                {/* Logo with Enhanced Glass Effect */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#20B2AA]/80 to-[#81D8D0]/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-[#20B2AA]/50 border border-white/30 hover:scale-110 hover:shadow-3xl transition-all duration-500 animate-float">
                    <img src={logoImage} alt="KMRL-Vault Logo" className="w-18 h-18" />
                  </div>
                </div>

                {/* Enhanced Title WITHOUT Background Container */}
                <div className="space-y-6">
                  <h1>
                    <span className="block text-5xl sm:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-[#20B2AA] via-[#81D8D0] to-blue-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl">
                      KMRL-Vault
                    </span>
                    <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-white/90 tracking-wide drop-shadow-lg">
                      Smart Documents. Safer Metro.
                    </span>
                  </h1>

                  {/* Enhanced Description with Simple Colored Text */}
                  <p className="text-lg sm:text-xl text-white/80 leading-relaxed drop-shadow-md">
                    Revolutionize Kochi Metro's document management with advanced AI. Upload engineering, regulatory, and operational files to get fast{' '}
                    <span className="text-[#20B2AA] font-bold">Risk Assessment</span>,{' '}
                    <span className="text-cyan-300 font-bold">Intelligent Summarization</span>, and{' '}
                    <span className="text-blue-300 font-bold">AI-Powered Chatbot Assistance</span>.
                  </p>
                </div>

                {/* Enhanced Tech Badges with Glassomorphism */}
                <div className="flex flex-wrap gap-4 mt-12">
                  {[
                    { icon: '🤖', text: 'Llama 3.3 70B', gradient: 'from-[#20B2AA] to-cyan-400' },
                    { icon: '📄', text: 'Enhanced PDF', gradient: 'from-[#20B2AA] to-[#81D8D0]' },
                    { icon: '🛡️', text: 'Secure Analysis', gradient: 'from-[#81D8D0] to-[#20B2AA]' },
                    { icon: '⚡', text: 'Lightning Fast', gradient: 'from-cyan-400 to-[#20B2AA]' }
                  ].map((badge, index) => (
                    <div key={index} className="group flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:bg-white/20 hover:border-[#20B2AA]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#20B2AA]/30 cursor-pointer">
                      <div className={`text-2xl p-2 rounded-xl bg-gradient-to-br ${badge.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {badge.icon}
                      </div>
                      <span className="font-bold text-white/90 group-hover:text-white transition-colors duration-300">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Metro Map - ORIGINAL POSITIONING WITH ENHANCED EFFECTS */}
              <div className="hidden lg:block relative -mt-8 -ml-20">
                <img 
                  src={mapImage} 
                  alt="Kochi Metro Map" 
                  className="w-[1100px] h-[800px] object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                  style={{ maxWidth: 'none' }}
                />
                
                {/* Enhanced Animated Station Dots */}
                <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-gradient-to-r from-[#20B2AA] to-cyan-400 rounded-full animate-ping shadow-2xl shadow-[#20B2AA]/50"></div>
                <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping delay-500 shadow-2xl shadow-blue-400/50"></div>
                <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-gradient-to-r from-cyan-300 to-[#20B2AA] rounded-full animate-ping delay-1000 shadow-2xl shadow-cyan-300/50"></div>
                
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#20B2AA]/20 via-transparent to-cyan-300/20 blur-2xl opacity-50 hover:opacity-80 transition-opacity duration-700 -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLETELY REDESIGNED: Clean Authentication Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-white via-[#20B2AA] to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
                Get Started with Smart Documents
              </h2>
              <p className="text-xl text-white/80 drop-shadow-md">
                Sign in to upload and analyze your technical, operational, and regulatory documents
              </p>
            </div>

            {/* Clean Button Layout */}
            <div className="space-y-6">
              {/* Sign In Button */}
              <div className="w-full max-w-md mx-auto">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full px-8 py-6 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl border border-white/20 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2"/>
                        <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span className="font-bold">Sign In</span>
                  </div>
                </button>
                <p className="text-sm text-white/60 text-center mt-3">
                  Already have an account? Welcome back!
                </p>
              </div>

              {/* Clean Divider */}
              <div className="flex items-center justify-center my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent max-w-xs"></div>
                <span className="px-6 text-white/70 font-medium text-sm">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent max-w-xs"></div>
              </div>

              {/* Create Account Button */}
              <div className="w-full max-w-md mx-auto">
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl border border-white/20 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span className="font-bold">Create Account</span>
                  </div>
                </button>
                <p className="text-sm text-white/60 text-center mt-3">
                  New to KMRL-Vault? Get started now!
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-white/80 font-medium text-sm">Enterprise-Grade Security Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Premium Header */}
            <div className="text-center mb-20">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl shadow-black/20">
                <h2 className="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-white via-[#20B2AA] to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
                  Powerful AI-Driven Analysis
                </h2>
                <p className="text-2xl text-white/80 drop-shadow-lg">
                  All critical metro documents analyzed at your fingertips
                </p>
              </div>
            </div>

            {/* Premium Feature Cards */}
            <div className="grid lg:grid-cols-3 gap-10">
              {[
                {
                  icon: '🔍',
                  title: 'Risk Analysis',
                  description: 'Identify potential operational, safety, and compliance risks in your documents with AI precision.',
                  gradient: 'from-red-500/20 to-orange-500/20',
                  border: 'border-red-400/30',
                  shadow: 'shadow-red-500/20'
                },
                {
                  icon: '📄',
                  title: 'Smart Summarization', 
                  description: 'Get comprehensive summaries with key information, actions, and critical points highlighted automatically.',
                  gradient: 'from-[#20B2AA]/20 to-cyan-400/20',
                  border: 'border-[#20B2AA]/30',
                  shadow: 'shadow-[#20B2AA]/20'
                },
                {
                  icon: '🤝',
                  title: 'AI-Powered Chatbot',
                  description: 'Ask questions and get instant, accurate answers from your uploaded documents.',
                  gradient: 'from-blue-500/20 to-purple-500/20',
                  border: 'border-blue-400/30',
                  shadow: 'shadow-blue-500/20'
                }
              ].map((feature, index) => (
                <div key={index} className={`group bg-white/5 backdrop-blur-2xl border ${feature.border} p-10 rounded-3xl hover:bg-white/10 transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl ${feature.shadow} relative overflow-hidden`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                  
                  {/* Top Gradient Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20B2AA] via-cyan-400 to-blue-500 group-hover:h-2 transition-all duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter drop-shadow-2xl">{feature.icon}</div>
                    <h3 className="text-3xl font-black text-white mb-6 group-hover:text-[#20B2AA] transition-colors duration-300">{feature.title}</h3>
                    <p className="text-white/80 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">{feature.description}</p>
                    
                    {/* Hover Effect Arrow */}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-0 group-hover:translate-x-2">
                      <div className="flex items-center gap-2 text-[#20B2AA] font-bold">
                        <span>Learn More</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Premium Footer */}
      <footer className="relative">
        <div className="bg-white/5 backdrop-blur-2xl border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white/80 text-lg font-medium">
              Powered by <span className="bg-gradient-to-r from-[#20B2AA] to-cyan-400 bg-clip-text text-transparent font-bold">KMRL-Vault</span> • Enterprise-Grade Security
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className={`w-4 h-4 rounded-full ${sessionToken ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-500 shadow-lg shadow-red-500/50'} animate-pulse`}></div>
              <span className="text-white/90 font-bold">
                Session {sessionToken ? 'Active' : 'Inactive'}
              </span>
              {sessionToken && (
                <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                  SECURE
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
