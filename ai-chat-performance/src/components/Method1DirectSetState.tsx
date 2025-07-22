import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MockSSE, generateLongMessage } from '../utils/mockSSE';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface Method1Props {
  id?: string;
}

const Method1DirectSetState: React.FC<Method1Props> = ({ id = 'method1' }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const sseRef = useRef<MockSSE | null>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const renderCountRef = useRef(0);
  
  const { testConfig, updateMetrics, updateMessage } = useAppStore();

  // Track renders for performance monitoring
  useEffect(() => {
    renderCountRef.current++;
    if (monitorRef.current) {
      monitorRef.current.recordRender();
    }
  });

  const startTest = () => {
    if (isRunning) return;
    
    // Reset state
    setMessage('');
    setProgress(0);
    setIsRunning(true);
    renderCountRef.current = 0;
    
    // Initialize performance monitor
    monitorRef.current = new PerformanceMonitor((metrics) => {
      updateMetrics(id, metrics);
    });
    monitorRef.current.start();
    
    // Generate test message
    const testMessage = generateLongMessage(testConfig.messageLength);
    
    // Create and start SSE
    sseRef.current = new MockSSE({
      message: testMessage,
      speed: testConfig.typingSpeed,
      onData: (char, index, isComplete) => {
        // Direct setState on every character - this is the performance bottleneck we're testing
        setMessage(prev => prev + char);
        setProgress((index + 1) / testMessage.length);
        
        // Update store message for comparison
        updateMessage(id, message + char);
        
        if (isComplete) {
          handleComplete();
        }
      },
      onComplete: handleComplete,
      onError: (error) => {
        console.error('SSE Error:', error);
        handleComplete();
      }
    });
    
    sseRef.current.start();
  };

  const handleComplete = () => {
    setIsRunning(false);
    
    if (monitorRef.current) {
      const finalMetrics = monitorRef.current.stop();
      updateMetrics(id, finalMetrics);
    }
    
    if (sseRef.current) {
      sseRef.current.stop();
    }
  };

  const stopTest = () => {
    if (sseRef.current) {
      sseRef.current.stop();
    }
    handleComplete();
  };

  const resetTest = () => {
    stopTest();
    setMessage('');
    setProgress(0);
    renderCountRef.current = 0;
    updateMessage(id, '');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.stop();
      }
      if (monitorRef.current) {
        monitorRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('methods.method1.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('methods.method1.description')}
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Renders: {renderCountRef.current}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{t('methods.method1.progress')}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Message Display */}
      <div className="flex-1 mb-4">
        <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
            {message}
            {isRunning && (
              <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={startTest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          {t('methods.method1.start')}
        </button>
        
        <button
          onClick={stopTest}
          disabled={!isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Square className="w-4 h-4" />
          {t('methods.method1.stop')}
        </button>
        
        <button
          onClick={resetTest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t('methods.method1.reset')}
        </button>
      </div>

      {/* Performance Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Characteristics:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Triggers re-render on every character</li>
          <li>• High render count and CPU usage</li>
          <li>• Simple implementation but poor performance</li>
          <li>• Suitable only for short messages</li>
        </ul>
      </div>
    </div>
  );
};

export default Method1DirectSetState;