'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, FileText, ArrowLeft, ArrowRight, CheckCircle, XCircle, Download, Settings, Zap } from 'lucide-react';

export default function Phase3() {
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [vendorConfig, setVendorConfig] = useState<any>(null);
  const [processingResults, setProcessingResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('processing');

  const handleMasterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMasterFile(e.target.files[0]);
    }
  };

  const handleVendorConfig = () => {
    setVendorConfig({
      name: 'Sample Vendor',
      requirements: ['first_name', 'last_name', 'email', 'phone', 'dob'],
      transformations: {
        'first_name': 'UPPERCASE',
        'last_name': 'UPPERCASE',
        'email': 'LOWERCASE'
      }
    });
  };

  const handleProcessing = async () => {
    if (!masterFile) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessingResults({
        totalRecords: 1250,
        validRecords: 1180,
        errorRecords: 70,
        vendors: [
          { name: 'Vendor A', records: 450, status: 'success' },
          { name: 'Vendor B', records: 380, status: 'success' },
          { name: 'Vendor C', records: 350, status: 'success' }
        ],
        errors: [
          { row: 45, field: 'email', issue: 'Invalid format' },
          { row: 67, field: 'phone', issue: 'Missing required field' },
          { row: 89, field: 'dob', issue: 'Invalid date format' }
        ]
      });
      setIsProcessing(false);
    }, 3000);
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
            Phase 3: Enrollment Processing & Neon Integration
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('processing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'processing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setActiveTab('vendor')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vendor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vendor Outputs
              </button>
              <button
                onClick={() => setActiveTab('neon')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'neon'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Neon SQL
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'processing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Master File</h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleMasterUpload}
                      className="hidden"
                      id="master-upload"
                    />
                    <label htmlFor="master-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">
                        {masterFile ? masterFile.name : 'Click to upload master enrollment file'}
                      </span>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleProcessing}
                    disabled={!masterFile || isProcessing}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Start Processing'}
                  </button>
                </div>

                {/* Results */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Results</h2>
                  {processingResults ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{processingResults.validRecords}</div>
                          <div className="text-sm text-gray-600">Valid</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{processingResults.errorRecords}</div>
                          <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{processingResults.totalRecords}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Processing</h3>
                        <div className="space-y-2">
                          {processingResults.vendors.map((vendor: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{vendor.name}</span>
                              </div>
                              <span className="text-sm text-gray-600">{vendor.records} records</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Upload file and start processing to see results</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'vendor' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Output Generation</h2>
                  <button
                    onClick={handleVendorConfig}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Configure Vendors
                  </button>
                </div>

                {vendorConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processingResults?.vendors.map((vendor: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{vendor.name}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Records:</span>
                            <span className="font-medium">{vendor.records}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className="text-green-600 font-medium">✓ Complete</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                          <Download className="w-4 h-4 inline mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'neon' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Neon SQL Blueprint Generation</h2>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="mb-2">-- Generated SQL for enrollment processing</div>
                  <div className="mb-2">CREATE TABLE IF NOT EXISTS enrollments (</div>
                  <div className="ml-4 mb-2">id SERIAL PRIMARY KEY,</div>
                  <div className="ml-4 mb-2">first_name VARCHAR(100) NOT NULL,</div>
                  <div className="ml-4 mb-2">last_name VARCHAR(100) NOT NULL,</div>
                  <div className="ml-4 mb-2">email VARCHAR(255) UNIQUE NOT NULL,</div>
                  <div className="ml-4 mb-2">phone VARCHAR(20),</div>
                  <div className="ml-4 mb-2">dob DATE,</div>
                  <div className="ml-4 mb-2">created_at TIMESTAMP DEFAULT NOW()</div>
                  <div className="mb-2">);</div>
                  <div className="mb-2"></div>
                  <div className="mb-2">-- Index for performance</div>
                  <div className="mb-2">CREATE INDEX idx_enrollments_email ON enrollments(email);</div>
                  <div className="mb-2">CREATE INDEX idx_enrollments_name ON enrollments(last_name, first_name);</div>
                </div>

                <div className="flex space-x-3">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Generate SQL
                  </button>
                  <button className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Download SQL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Link
            href="/phase2"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous: Phase 2
          </Link>
          <Link
            href="/phase4"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            Next: Phase 4
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 