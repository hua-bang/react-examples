import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Play, Square, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const ConfigPanel: React.FC = () => {
  const { t } = useTranslation();
  const { 
    testConfig, 
    isRunning, 
    updateTestConfig, 
    startTest, 
    stopTest, 
    resetResults 
  } = useAppStore();

  const handleConfigChange = (key: keyof typeof testConfig, value: any) => {
    updateTestConfig({ [key]: value });
  };

  const handleStartTest = () => {
    if (!isRunning) {
      startTest();
    }
  };

  const handleStopTest = () => {
    if (isRunning) {
      stopTest();
    }
  };

  const handleResetResults = () => {
    if (!isRunning) {
      resetResults();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">{t('config.title')}</h2>
      </div>

      <div className="space-y-6">
        {/* Message Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('config.messageLength')}
          </label>
          <input
            type="number"
            min="100"
            max="10000"
            step="100"
            value={testConfig.messageLength}
            onChange={(e) => handleConfigChange('messageLength', parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('config.messageLengthDesc')}
          </p>
        </div>

        {/* Typing Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('config.typingSpeed')}
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={testConfig.typingSpeed}
            onChange={(e) => handleConfigChange('typingSpeed', parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('config.typingSpeedDesc')}
          </p>
        </div>

        {/* Batch Size (for Method 4) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('config.batchSize')}
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={testConfig.batchSize}
            onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('config.batchSizeDesc')}
          </p>
        </div>

        {/* Test Iterations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('config.testIterations')}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={testConfig.iterations}
            onChange={(e) => handleConfigChange('iterations', parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('config.testIterationsDesc')}
          </p>
        </div>

        {/* Auto Start Delay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('config.autoStartDelay')}
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.5"
            value={testConfig.autoStartDelay}
            onChange={(e) => handleConfigChange('autoStartDelay', parseFloat(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('config.autoStartDelayDesc')}
          </p>
        </div>

        {/* Enable Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('config.enableTestMethods')}
          </label>
          <div className="space-y-2">
            {[
              { key: 'method1', label: t('config.method1'), color: 'red' },
              { key: 'method2', label: t('config.method2'), color: 'green' },
              { key: 'method3', label: t('config.method3'), color: 'yellow' },
              { key: 'method4', label: t('config.method4'), color: 'purple' },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.enabledMethods.includes(key as any)}
                  onChange={(e) => {
                    const methods = testConfig.enabledMethods;
                    if (e.target.checked) {
                      handleConfigChange('enabledMethods', [...methods, key]);
                    } else {
                      handleConfigChange('enabledMethods', methods.filter(m => m !== key));
                    }
                  }}
                  disabled={isRunning}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <span className={`text-sm ${
                  color === 'red' ? 'text-red-600' :
                  color === 'green' ? 'text-green-600' :
                  color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
                }`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleStartTest}
            disabled={isRunning || testConfig.enabledMethods.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? t('config.running') : t('config.startTest')}
          </button>
          
          <button
            onClick={handleStopTest}
            disabled={!isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetResults}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Status */}
        {isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">
                {t('config.testInProgress')}
              </span>
            </div>
          </div>
        )}

        {testConfig.enabledMethods.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <span className="text-sm text-yellow-800">
              {t('config.selectMethod')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;