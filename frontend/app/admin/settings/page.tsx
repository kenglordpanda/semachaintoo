'use client';

import React, { useState } from 'react';

interface SystemSettings {
  vectorDatabase: {
    provider: 'weaviate' | 'chroma';
    url: string;
    apiKey: string;
  };
  semanticAnalysis: {
    model: string;
    chunkSize: number;
    chunkOverlap: number;
    similarityThreshold: number;
  };
  api: {
    rateLimit: number;
    timeout: number;
    maxBatchSize: number;
  };
  security: {
    jwtExpiration: number;
    passwordMinLength: number;
    requireMfa: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    vectorDatabase: {
      provider: 'weaviate',
      url: 'http://localhost:8080',
      apiKey: '',
    },
    semanticAnalysis: {
      model: 'sentence-transformers/all-mpnet-base-v2',
      chunkSize: 512,
      chunkOverlap: 50,
      similarityThreshold: 0.7,
    },
    api: {
      rateLimit: 100,
      timeout: 30,
      maxBatchSize: 50,
    },
    security: {
      jwtExpiration: 24,
      passwordMinLength: 8,
      requireMfa: false,
    },
  });

  const handleSave = async () => {
    // Implement save functionality
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* Vector Database Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Vector Database</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <select
                id="provider"
                name="provider"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.vectorDatabase.provider}
                onChange={(e) => setSettings({
                  ...settings,
                  vectorDatabase: {
                    ...settings.vectorDatabase,
                    provider: e.target.value as 'weaviate' | 'chroma',
                  },
                })}
              >
                <option value="weaviate">Weaviate</option>
                <option value="chroma">Chroma</option>
              </select>
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <input
                type="text"
                name="url"
                id="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.vectorDatabase.url}
                onChange={(e) => setSettings({
                  ...settings,
                  vectorDatabase: {
                    ...settings.vectorDatabase,
                    url: e.target.value,
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="password"
                name="apiKey"
                id="apiKey"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.vectorDatabase.apiKey}
                onChange={(e) => setSettings({
                  ...settings,
                  vectorDatabase: {
                    ...settings.vectorDatabase,
                    apiKey: e.target.value,
                  },
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Analysis Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Semantic Analysis</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                name="model"
                id="model"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.semanticAnalysis.model}
                onChange={(e) => setSettings({
                  ...settings,
                  semanticAnalysis: {
                    ...settings.semanticAnalysis,
                    model: e.target.value,
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="chunkSize" className="block text-sm font-medium text-gray-700">
                Chunk Size
              </label>
              <input
                type="number"
                name="chunkSize"
                id="chunkSize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.semanticAnalysis.chunkSize}
                onChange={(e) => setSettings({
                  ...settings,
                  semanticAnalysis: {
                    ...settings.semanticAnalysis,
                    chunkSize: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="chunkOverlap" className="block text-sm font-medium text-gray-700">
                Chunk Overlap
              </label>
              <input
                type="number"
                name="chunkOverlap"
                id="chunkOverlap"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.semanticAnalysis.chunkOverlap}
                onChange={(e) => setSettings({
                  ...settings,
                  semanticAnalysis: {
                    ...settings.semanticAnalysis,
                    chunkOverlap: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="similarityThreshold" className="block text-sm font-medium text-gray-700">
                Similarity Threshold
              </label>
              <input
                type="number"
                name="similarityThreshold"
                id="similarityThreshold"
                step="0.1"
                min="0"
                max="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.semanticAnalysis.similarityThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  semanticAnalysis: {
                    ...settings.semanticAnalysis,
                    similarityThreshold: parseFloat(e.target.value),
                  },
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">API Settings</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700">
                Rate Limit (requests per minute)
              </label>
              <input
                type="number"
                name="rateLimit"
                id="rateLimit"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.api.rateLimit}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    rateLimit: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                Timeout (seconds)
              </label>
              <input
                type="number"
                name="timeout"
                id="timeout"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.api.timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    timeout: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="maxBatchSize" className="block text-sm font-medium text-gray-700">
                Max Batch Size
              </label>
              <input
                type="number"
                name="maxBatchSize"
                id="maxBatchSize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.api.maxBatchSize}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    maxBatchSize: parseInt(e.target.value),
                  },
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="jwtExpiration" className="block text-sm font-medium text-gray-700">
                JWT Expiration (hours)
              </label>
              <input
                type="number"
                name="jwtExpiration"
                id="jwtExpiration"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.security.jwtExpiration}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    jwtExpiration: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div>
              <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                Minimum Password Length
              </label>
              <input
                type="number"
                name="passwordMinLength"
                id="passwordMinLength"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={settings.security.passwordMinLength}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    passwordMinLength: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="requireMfa"
                id="requireMfa"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.security.requireMfa}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    requireMfa: e.target.checked,
                  },
                })}
              />
              <label htmlFor="requireMfa" className="ml-2 block text-sm text-gray-900">
                Require Multi-Factor Authentication
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 