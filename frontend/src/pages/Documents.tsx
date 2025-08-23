import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Search, FileCheck } from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-200/50">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Document Analysis</h1>
                <p className="text-gray-600">AI-powered SOF/CP parsing and maritime document processing</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Document Uploader */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <DocumentUploader />
          </div>
        </motion.div>

        {/* Features Info */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Smart Upload</h3>
            </div>
            <p className="text-gray-600 text-sm">Drag & drop or click to upload SOF, CP, and other maritime documents for instant analysis.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Analysis</h3>
            </div>
            <p className="text-gray-600 text-sm">Powered by PyMuPDF and Google Gemini AI for intelligent document parsing and data extraction.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Compliance Check</h3>
            </div>
            <p className="text-gray-600 text-sm">Automated validation of SOF compliance against Charter Party clauses and maritime regulations.</p>
          </div>
        </motion.div>

        {/* Document Types */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Document Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Statement of Facts (SOF)</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Laytime calculations and demurrage analysis</li>
                  <li>• Port operations and cargo handling details</li>
                  <li>• Weather delays and force majeure events</li>
                  <li>• Port charges and additional expenses</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Charter Party (CP)</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Clause explanations and interpretations</li>
                  <li>• Demurrage and despatch calculations</li>
                  <li>• Laytime provisions and exceptions</li>
                  <li>• Force majeure and liability clauses</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Documents; 