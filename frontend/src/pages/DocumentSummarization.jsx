import React, { useState, useEffect } from 'react';
import { runDocumentSummary } from '../services/api';

// Expandable Text Component for long content
const ExpandableText = ({ text, limit = 800 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= limit) {
    return (
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
        {text || 'No content available'}
      </p>
    );
  }

  return (
    <div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
        {expanded ? text : text.substring(0, limit) + '...'}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-[#20B2AA] hover:text-[#81D8D0] font-medium text-sm underline transition-colors"
      >
        {expanded ? 'Show Less ↑' : 'Read Full Content ↓'}
      </button>
    </div>
  );
};

const DocumentSummarization = ({ documentInfo }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    keyPoints: true,
    financial: true,
    timeline: true,
    obligations: false,
    risks: false,
    chunks: true,
    metadata: false
  });
  const [showAllChunks, setShowAllChunks] = useState(false);

  const runAnalysis = async () => {
    if (!documentInfo?.document_id && !documentInfo?.document_name) {
      setError('No document information available. Please upload a document first.');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('Performing comprehensive document analysis with enhanced AI...');

    try {
      const docId = documentInfo.document_id || documentInfo.document_name;
      console.log('📄 Starting comprehensive document summary for:', docId);

      const response = await runDocumentSummary(docId);

      if (response.success) {
        console.log('✅ Comprehensive document summary successful:', response.data);
        setAnalysis(response.data);
        setDebugInfo(`Comprehensive analysis complete: ${response.data.relevant_chunks?.length || 0} sections analyzed`);
      } else {
        console.error('❌ Document summary failed:', response.error);
        setError(response.error || 'Document summary failed');
        setDebugInfo('Summary generation failed');
      }
    } catch (err) {
      console.error('❌ Document summary error:', err);
      setError('Summary generation failed. Please try again.');
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentInfo && !analysis && !loading) {
      runAnalysis();
    }
  }, [documentInfo]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatSummaryText = (text) => {
    if (!text) return [];
    return text.split('\n\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph.length > 0);
  };

  const getSummaryMetrics = () => {
    if (!analysis) return {};

    const summaryText = analysis.analysis?.summary || '';
    const wordCount = summaryText.split(/\s+/).length;
    const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const chunks = analysis.relevant_chunks?.length || 0;

    return {
      wordCount,
      sentences,
      chunks,
      readingTime: Math.ceil(wordCount / 200)
    };
  };

  return (
    <div className="w-full max-w-none mx-auto bg-gradient-to-br from-[#CCFFEB] via-[#EAD2AC] to-[#CCFFEB] min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                Document Analysis
              </h2>
              <p className="text-gray-600">
                Complete legal document breakdown with detailed insights
              </p>
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#20B2AA]/50 disabled:hover:transform-none disabled:hover:shadow-none disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Comprehensive Analysis...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                  </svg>
                  <span>Generate Comprehensive Analysis</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h3 className="text-red-600 font-semibold mb-1">Analysis Error</h3>
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#81D8D0]/30 border-t-[#20B2AA] rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-[#EBA536]/20 border-b-[#EBA536] rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Comprehensive Analysis in Progress</h3>
                <p className="text-gray-600">{debugInfo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Document Overview */}
            <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#81D8D0] to-[#20B2AA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Document Overview</h3>
                  <p className="text-gray-600">Contract classification and parties involved</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                  <h5 className="text-[#20B2AA] font-semibold mb-2">Contract Type</h5>
                  <p className="text-gray-700">{analysis.analysis?.contract_type || 'Legal Agreement'}</p>
                </div>

                {analysis.analysis?.parties && (
                  <div className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                    <h5 className="text-[#20B2AA] font-semibold mb-2">Parties Involved</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Primary:</span> <span className="text-gray-800">{analysis.analysis.parties.primary_party}</span></div>
                      <div><span className="text-gray-600">Secondary:</span> <span className="text-gray-800">{analysis.analysis.parties.secondary_party}</span></div>
                      <div><span className="text-gray-600">Relationship:</span> <span className="text-gray-800">{analysis.analysis.parties.relationship}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive Summary Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#20B2AA]/10 to-[#81D8D0]/10 border-b border-[#81D8D0]/30 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6.253V12L16.5 14.25M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Comprehensive Document Summary</h3>
                      <p className="text-gray-600">Complete analysis covering all important aspects</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-6">
                  <div className="space-y-4">
                    {formatSummaryText(analysis.analysis?.summary || 'No summary available').map((paragraph, index) => (
                      <p key={index} className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Points Section */}
            {analysis.analysis?.key_points && analysis.analysis.key_points.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#EBA536]/10 to-[#20B2AA]/10 border-b border-[#81D8D0]/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#EBA536] to-[#20B2AA] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Key Contract Provisions</h3>
                      <p className="text-gray-600">Critical terms and conditions</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4">
                    {analysis.analysis.key_points.map((point, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-[#CCFFEB]/50 rounded-xl border border-[#81D8D0]/30">
                        <div className="w-8 h-8 bg-[#EBA536]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-[#EBA536] text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Financial Details Section */}
            {analysis.analysis?.financial_details && (
              <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#EBA536]/10 to-[#EAD2AC]/20 border-b border-[#81D8D0]/30 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#EBA536] to-[#EAD2AC] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7M21 12H3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Financial Terms</h3>
                        <p className="text-gray-600">Compensation, penalties, and payment details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('financial')}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${expandedSections.financial ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedSections.financial && (
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(analysis.analysis.financial_details).map(([key, value]) => (
                        <div key={key} className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                          <h5 className="text-[#EBA536] font-semibold mb-2 capitalize">
                            {key.replace('_', ' ')}
                          </h5>
                          <p className="text-gray-800 text-sm leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Section */}
            {analysis.analysis?.timeline && (
              <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#81D8D0]/10 to-[#20B2AA]/10 border-b border-[#81D8D0]/30 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#81D8D0] to-[#20B2AA] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Timeline & Milestones</h3>
                        <p className="text-gray-600">Important dates and deadlines</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('timeline')}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${expandedSections.timeline ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedSections.timeline && (
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(analysis.analysis.timeline).map(([key, value]) => (
                        <div key={key} className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                          <h5 className="text-[#20B2AA] font-semibold mb-2 capitalize">
                            {key.replace('_', ' ')}
                          </h5>
                          <p className="text-gray-800 text-sm leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Obligations Section */}
            {analysis.analysis?.obligations && (
              <div className="bg-white/60 backdrop-blur-sm border border-[#81D8D0]/30 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#20B2AA]/10 to-[#81D8D0]/10 border-b border-[#81D8D0]/30 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Rights & Obligations</h3>
                        <p className="text-gray-600">Responsibilities of each party</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection('obligations')}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${expandedSections.obligations ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedSections.obligations && (
                  <div className="p-6">
                    <div className="space-y-6">
                      {Object.entries(analysis.analysis.obligations).map(([key, value]) => (
                        <div key={key} className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                          <h5 className="text-[#20B2AA] font-semibold mb-2 capitalize">
                            {key.replace('_', ' ')}
                          </h5>
                          <p className="text-gray-800 text-sm leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Debug Information */}
            {debugInfo && (
              <div className="bg-[#CCFFEB]/50 border border-[#81D8D0]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-pulse"></div>
                  <span className="text-gray-600">{debugInfo}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Analysis State */}
        {!loading && !analysis && !error && (
          <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#81D8D0]/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#CCFFEB]/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#81D8D0]" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">Ready for Comprehensive Analysis</h4>
            <p className="text-gray-600 max-w-lg mx-auto">
              Click "Generate Comprehensive Analysis" to create a complete document breakdown with detailed insights, financial terms, timeline, obligations, and risk analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSummarization;