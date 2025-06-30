'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, FileText, ArrowLeft, ArrowRight, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function Phase2() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [mappingResults, setMappingResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const handleMasterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMasterFile(e.target.files[0]);
    }
  };

  const handleMapping = async () => {
    if (!templateFile || !masterFile) return;
    
    setIsProcessing(true);
    // Simulate mapping process
    setTimeout(() => {
      setMappingResults({
        mappedColumns: 15,
        totalColumns: 20,
        confidence: 85,
        suggestions: [
          { template: 'First Name', master: 'first_name', confidence: 95 },
          { template: 'Last Name', master: 'last_name', confidence: 92 },
          { template: 'Email', master: 'email_address', confidence: 88 },
          { template: 'Phone', master: 'phone_number', confidence: 85 }
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Phase 2: Template & Master File Mapping
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
            
            {/* Template File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template File (CSV/XLSX)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleTemplateUpload}
                  className="hidden"
                  id="template-upload"
                />
                <label htmlFor="template-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700">
                    {templateFile ? templateFile.name : 'Click to upload template file'}
                  </span>
                </label>
              </div>
            </div>

            {/* Master File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Enrollment File (CSV/XLSX)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleMasterUpload}
                  className="hidden"
                  id="master-upload"
                />
                <label htmlFor="master-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700">
                    {masterFile ? masterFile.name : 'Click to upload master file'}
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleMapping}
              disabled={!templateFile || !masterFile || isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Start Auto-Mapping'}
            </button>
          </div>

          {/* Mapping Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapping Results</h2>
            
            {mappingResults ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{mappingResults.mappedColumns}</div>
                    <div className="text-sm text-gray-600">Mapped</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mappingResults.totalColumns}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{mappingResults.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                </div>

                {/* Column Mappings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Column Mappings</h3>
                  <div className="space-y-2">
                    {mappingResults.suggestions.map((mapping: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">{mapping.template}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{mapping.master}</span>
                        </div>
                        <span className="text-sm text-gray-500">{mapping.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6">
                  <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Manual Override
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Export Mapping
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Upload files and start mapping to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Link
            href="/phase1"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous: Phase 1
          </Link>
          <Link
            href="/phase3"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            Next: Phase 3
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 