// Home.jsx - Complete Tailwind CSS Version with New Color Palette
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
      return process.env.REACT_APP_API_BASE_URL || 'https://accordai.onrender.com/api/v1';
    }
    if (window.REACT_APP_API_BASE_URL) {
      return window.REACT_APP_API_BASE_URL;
    }
    return 'https://accordai.onrender.com/api/v1';
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#CCFFEB] via-[#EAD2AC] to-[#CCFFEB] text-gray-800 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-5 w-96 h-96 bg-gradient-to-r from-[#81D8D0]/30 to-[#20B2AA]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-5 w-80 h-80 bg-gradient-to-r from-[#20B2AA]/30 to-[#EBA536]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-[#81D8D0]/30 to-[#20B2AA]/30 rounded-full blur-3xl animate-pulse delay-2000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with Map */}
<section className="pt-32 pb-16 px-4">
  <div className="max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      {/* Left Side: Content */}
      <div className="text-left space-y-8">
        {/* Logo */}
        <div>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-2xl shadow-2xl shadow-[#20B2AA]/50 animate-float">
            <img src={logoImage} alt="KMRL-Vault Logo" className="w-16 h-16" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1>
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-[#1a9d9a] via-[#20B2AA] to-[#186b6b] bg-clip-text text-transparent leading-tight">
              KMRL-Vault
            </span>
            <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-600 tracking-wide">
              Smart Documents. Safer Metro
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl leading-relaxed">
            Revolutionize Kochi Metro's document management with advanced AI. Upload engineering, regulatory, and operational files to get fast{' '}
            <span className="text-[#20B2AA] font-semibold">Risk Assessment</span>,{' '}
            <span className="text-[#20B2AA] font-semibold">Intelligent Summarization</span>, and{' '}
            <span className="text-[#20B2AA] font-semibold">Negotiation Assistance</span>.
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: '🤖', text: 'Llama 3.3 70B' },
              { icon: '📄', text: 'Enhanced PDF' },
              { icon: '🛡️', text: 'Secure Analysis' }
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm border border-[#81D8D0]/50 rounded-full hover:bg-[#81D8D0]/20 hover:border-[#20B2AA]/70 transition-all duration-300 hover:-translate-y-1">
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-semibold text-gray-700">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Metro Map - HIDDEN ON MOBILE/TABLET, VISIBLE ON DESKTOP */}
<div className="hidden lg:block relative -mt-9 -ml-8">
        <img 
          src={mapImage} 
          alt="Kochi Metro Map" 
className="w-[900px] h-[700px] object-contain hover:scale-105 transition-transform duration-500"
          style={{ maxWidth: 'none' }}
        />
        
        {/* Animated Dots for Stations */}
        <div className="absolute top-1/4 left-1/3 w-5 h-5 bg-[#20B2AA] rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-[#EBA536] rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-1/3 left-1/2 w-5 h-5 bg-[#81D8D0] rounded-full animate-ping delay-1000"></div>
      </div>
    </div>
  </div>
</section>

        {/* Upload Section */}
        <section className="py-16 px-4 bg-white/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                Upload Your Document
              </h2>
              <p className="text-xl text-gray-600">
                Drag and drop technical / operational / regulatory files, or click to browse
              </p>
            </div>

            {/* Upload Zone */}
            <div 
              className={`relative w-full min-h-96 bg-white/40 backdrop-blur-sm border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 mb-8 ${
                isDragging 
                  ? 'border-[#EBA536] bg-[#EBA536]/10 scale-105' 
                  : selectedFile 
                    ? 'border-[#20B2AA] bg-[#20B2AA]/5' 
                    : isProcessing 
                      ? 'border-[#EBA536] bg-[#EBA536]/5 cursor-not-allowed' 
                      : 'border-[#81D8D0]/70 hover:border-[#20B2AA] hover:bg-[#81D8D0]/10 hover:-translate-y-2'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_FORMATS.join(',')}
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />

              {!selectedFile ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 text-[#81D8D0] animate-bounce">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Drop your document here</h3>
                    <p className="text-xl text-gray-600">
                      or <span className="text-[#20B2AA] font-semibold underline">click to select a file</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {['PDF', 'DOC', 'DOCX', 'TXT'].map((format) => (
                      <div key={format} className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-lg border border-[#81D8D0]/30">
                        <span className="text-2xl">📄</span>
                        <span className="text-sm font-semibold text-gray-600">{format}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-4">Maximum file size: 50MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-6 p-6 bg-white/50 rounded-2xl text-left relative">
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-24 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                      selectedFile.name.toLowerCase().endsWith('.pdf') 
                        ? 'bg-gradient-to-r from-[#EBA536] to-[#EBA536]' 
                        : 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0]'
                    }`}>
                      {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{selectedFile.name}</h3>
                    <p className="text-gray-600 mb-3">{formatFileSize(selectedFile.size)}</p>
                    {selectedFile.name.toLowerCase().endsWith('.pdf') && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white text-sm font-semibold rounded-full">
                        <span>✨</span>
                        Enhanced PDF Processing
                      </span>
                    )}
                  </div>
                  <button 
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500/20 border-2 border-red-500/50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setError('');
                      setSuccess(false);
                      setProcessingResult(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-4 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600">
                <span className="text-2xl">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Process Button */}
            {selectedFile && !isProcessing && !success && (
              <button 
                className="w-full max-w-md mx-auto block bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#20B2AA]/50"
                onClick={processDocument}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span className="text-lg">
                    {selectedFile.name.toLowerCase().endsWith('.pdf') 
                      ? 'Analyze PDF with AI' 
                      : 'Process Document'}
                  </span>
                </div>
              </button>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-[#81D8D0]/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 border-4 border-[#81D8D0]/30 border-t-[#20B2AA] rounded-full animate-spin"></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Processing Your Document</h3>
                    <p className="text-gray-600">{processingStage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-[#EAD2AC] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] transition-all duration-300 relative"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-[#20B2AA] font-bold min-w-12">{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Success Status */}
            {success && processingResult && (
              <div className="bg-[#20B2AA]/10 backdrop-blur-sm border border-[#20B2AA]/30 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-3xl">
                    ✅
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Document Successfully Processed! 🎉</h3>
                    <p className="text-gray-700">Your document has been analyzed with {processingResult.chunksStored} intelligent chunks.</p>
                  </div>
                </div>

                <button 
                  className="w-full max-w-md mx-auto block bg-gradient-to-r from-[#20B2AA] to-[#EBA536] hover:from-[#20B2AA] hover:to-[#EBA536] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#20B2AA]/50"
                  onClick={navigateToAnalysis}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span className="text-lg">Start Legal Analysis</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                Powerful AI-Driven Analysis
              </h2>
              <p className="text-xl text-gray-600">
                All critical metro documents analyzed at your fingertips
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔍',
                  title: 'Risk Analysis',
                  description: 'Identify potential operational, safety, and compliance risks in your documents with AI precision.'
                },
                {
                  icon: '📄',
                  title: 'Smart Summarization',
                  description: 'Get comprehensive summaries with key information, actions, and critical points highlighted automatically.'
                },
                {
                  icon: '🤝',
                  title: 'Negotiation Assistant',
                  description: 'Generate professional email templates and negotiation strategies based on contract analysis results.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white/40 backdrop-blur-sm border border-[#81D8D0]/30 p-8 rounded-2xl hover:bg-white/60 hover:border-[#20B2AA]/50 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20B2AA] via-[#81D8D0] to-[#EBA536]"></div>
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-[#81D8D0]/30 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            Powered by KMRL-Vault • Enterprise-Grade Security
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sessionToken ? 'bg-[#20B2AA]' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-gray-600 text-sm">
              Session {sessionToken ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
