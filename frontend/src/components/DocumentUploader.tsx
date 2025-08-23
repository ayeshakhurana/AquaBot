import React, { useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

interface DocumentAnalysis {
  filename: string;
  file_format: string;
  document_type?: {
    primary_type: string;
    confidence: number;
  };
  extracted_data?: Record<string, any[]>;
  summary?: string;
  confidence_scores?: Record<string, number>;
  laytime_calculations?: any;
  financial_analysis?: any;
  error?: string;
}

const DocumentUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('general');

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const form = new FormData();
      form.append('file', file);
      form.append('analysis_type', analysisType);
      
              const res = await fetch(API_ENDPOINTS.documents, {
        method: 'POST',
        body: form
      });
      
      if (!res.ok) throw new Error('Failed to analyze document');
      
      const json = await res.json();
      setResult(json);
    } catch (e: any) {
      setError(e.message || 'Error analyzing document');
    } finally {
      setLoading(false);
    }
  };

  const renderExtractedData = (data: Record<string, any[]>) => {
    return Object.entries(data).map(([key, values]) => (
      <div key={key} className="mb-3">
        <h4 className="font-medium text-gray-800 capitalize mb-1">
          {key.replace(/_/g, ' ')}:
        </h4>
        <div className="space-y-1">
          {values.slice(0, 5).map((value, idx) => (
            <div key={idx} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
              {value}
            </div>
          ))}
          {values.length > 5 && (
            <div className="text-xs text-gray-500">
              +{values.length - 5} more items
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderLaytimeCalculations = (laytime: any) => {
    if (!laytime) return null;
    
    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">Laytime Analysis</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(laytime).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-blue-700 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-blue-600 ml-1">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFinancialAnalysis = (financial: any) => {
    if (!financial) return null;
    
    return (
      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <h4 className="font-medium text-green-800 mb-2">Financial Implications</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(financial).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-green-700 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-green-600 ml-1">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📄 Document Analysis
      </h2>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Document
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Analysis Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analysis Type
          </label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">General Analysis</option>
            <option value="sof">SOF (Statement of Facts)</option>
            <option value="cp">Charter Party</option>
          </select>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Analyzing...' : 'Analyze Document'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && !result.error && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Analysis Results: {result.filename}
            </h3>

            {/* Document Type */}
            {result.document_type && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-1">Document Classification</h4>
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Type:</span> {result.document_type.primary_type.replace(/_/g, ' ')}
                  <span className="ml-2 text-xs">
                    (Confidence: {(result.document_type.confidence * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Extracted Data */}
            {result.extracted_data && Object.keys(result.extracted_data).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Extracted Information</h4>
                {renderExtractedData(result.extracted_data)}
              </div>
            )}

            {/* Laytime Calculations */}
            {result.laytime_calculations && renderLaytimeCalculations(result.laytime_calculations)}

            {/* Financial Analysis */}
            {result.financial_analysis && renderFinancialAnalysis(result.financial_analysis)}

            {/* Summary */}
            {result.summary && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">Summary</h4>
                <p className="text-sm text-yellow-700">{result.summary}</p>
              </div>
            )}

            {/* Confidence Scores */}
            {result.confidence_scores && (
              <div className="mt-4 p-3 bg-purple-50 rounded-md">
                <h4 className="font-medium text-purple-800 mb-2">Confidence Scores</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(result.confidence_scores).map(([key, score]) => (
                    <div key={key}>
                      <span className="font-medium text-purple-700 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-purple-600 ml-1">{(score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error in Result */}
        {result && result.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader; 