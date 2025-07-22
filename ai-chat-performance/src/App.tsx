import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Github, Info } from 'lucide-react';
import { useAppStore } from './stores/useAppStore';
import ConfigPanel from './components/ConfigPanel';
import PerformancePanel from './components/PerformancePanel';
import ResultsComparison from './components/ResultsComparison';
import Method1DirectSetState from './components/Method1DirectSetState';
import Method2CreatePortal from './components/Method2CreatePortal';
import Method3ManualDOM from './components/Method3ManualDOM';
import Method4Optimized from './components/Method4Optimized';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const { t } = useTranslation();
  const { testConfig, isRunning, currentMethod } = useAppStore();

  // Auto-scroll to active test method
  useEffect(() => {
    if (currentMethod) {
      const element = document.getElementById(`test-${currentMethod}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMethod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('app.title')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>{t('app.methods')} • {t('app.monitoring')} • {t('app.analysis')}</span>
              </div>
              <LanguageSwitcher />
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>{t('app.source')}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1">
            <ConfigPanel />
          </div>

          {/* Right Column - Performance & Results */}
          <div className="lg:col-span-2 space-y-8">
            <PerformancePanel />
            <ResultsComparison />
          </div>
        </div>

        {/* Test Methods Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('app.testMethods')}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t('app.testMethodsDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Method 1: Direct setState */}
            {testConfig.enabledMethods.includes('method1') && (
              <div 
                id="test-method1" 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  currentMethod === 'method1' ? 'ring-4 ring-red-200 shadow-xl' : ''
                }`}
              >
                <div className="bg-red-50 border-b border-red-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-red-800">
                      Method 1: Direct setState
                    </h3>
                    {currentMethod === 'method1' && (
                      <div className="ml-auto">
                        <div className="animate-pulse flex items-center gap-2 text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <span className="text-sm font-medium">Running</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Updates component state on every character - baseline approach
                  </p>
                </div>
                <div className="p-6">
                  <Method1DirectSetState />
                </div>
              </div>
            )}

            {/* Method 2: createPortal */}
            {testConfig.enabledMethods.includes('method2') && (
              <div 
                id="test-method2" 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  currentMethod === 'method2' ? 'ring-4 ring-green-200 shadow-xl' : ''
                }`}
              >
                <div className="bg-green-50 border-b border-green-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Method 2: createPortal + setState
                    </h3>
                    {currentMethod === 'method2' && (
                      <div className="ml-auto">
                        <div className="animate-pulse flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                          <span className="text-sm font-medium">Running</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Isolates rendering using React Portal - partial optimization
                  </p>
                </div>
                <div className="p-6">
                  <Method2CreatePortal />
                </div>
              </div>
            )}

            {/* Method 3: Manual DOM */}
            {testConfig.enabledMethods.includes('method3') && (
              <div 
                id="test-method3" 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  currentMethod === 'method3' ? 'ring-4 ring-yellow-200 shadow-xl' : ''
                }`}
              >
                <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-yellow-800">
                      Method 3: Manual DOM + setState
                    </h3>
                    {currentMethod === 'method3' && (
                      <div className="ml-auto">
                        <div className="animate-pulse flex items-center gap-2 text-yellow-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                          <span className="text-sm font-medium">Running</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Direct DOM manipulation during streaming - performance focused
                  </p>
                </div>
                <div className="p-6">
                  <Method3ManualDOM />
                </div>
              </div>
            )}

            {/* Method 4: React Optimized */}
            {testConfig.enabledMethods.includes('method4') && (
              <div 
                id="test-method4" 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  currentMethod === 'method4' ? 'ring-4 ring-purple-200 shadow-xl' : ''
                }`}
              >
                <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-purple-800">
                      Method 4: React Optimized + Time Slicing
                    </h3>
                    {currentMethod === 'method4' && (
                      <div className="ml-auto">
                        <div className="animate-pulse flex items-center gap-2 text-purple-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                          <span className="text-sm font-medium">Running</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    React.memo + useMemo + time slicing - production optimized
                  </p>
                </div>
                <div className="p-6">
                  <Method4Optimized />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            Built with React + TypeScript + Vite + Tailwind CSS • 
            Performance monitoring with custom hooks • 
            Charts powered by Recharts
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
