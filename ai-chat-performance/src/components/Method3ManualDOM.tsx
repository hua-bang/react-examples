import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MockSSE, generateLongMessage } from '../utils/mockSSE';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface Method3Props {
  id?: string;
}

const Method3ManualDOM: React.FC<Method3Props> = ({ id = 'method3' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalMessage, setFinalMessage] = useState(''); // Only set once at the end
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const sseRef = useRef<MockSSE | null>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const renderCountRef = useRef(0);
  const currentMessageRef = useRef('');
  
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
    setProgress(0);
    setFinalMessage('');
    setIsRunning(true);
    renderCountRef.current = 0;
    currentMessageRef.current = '';
    
    // Clear DOM content
    if (messageContainerRef.current) {
      messageContainerRef.current.textContent = '';
    }
    
    // Show cursor
    if (cursorRef.current) {
      cursorRef.current.style.display = 'inline-block';
    }
    
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
        // Manual DOM manipulation - no React re-renders during typing
        if (messageContainerRef.current) {
          currentMessageRef.current += char;
          messageContainerRef.current.textContent = currentMessageRef.current;
        }
        
        // Only update progress state (minimal re-renders)
        const newProgress = (index + 1) / testMessage.length;
        if (Math.floor(newProgress * 100) !== Math.floor(progress * 100)) {
          setProgress(newProgress);
        }
        
        if (isComplete) {
          handleComplete(testMessage);
        }
      },
      onComplete: () => handleComplete(testMessage),
      onError: (error) => {
        console.error('SSE Error:', error);
        handleComplete(testMessage);
      }
    });
    
    sseRef.current.start();
  };

  const handleComplete = (testMessage: string) => {
    setIsRunning(false);
    setProgress(1);
    
    // Hide cursor
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
    
    // Now set the final message in React state (single setState at the end)
    setFinalMessage(currentMessageRef.current);
    updateMessage(id, currentMessageRef.current);
    
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
    
    setIsRunning(false);
    
    // Hide cursor
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
    
    // Set whatever we have so far
    setFinalMessage(currentMessageRef.current);
    updateMessage(id, currentMessageRef.current);
    
    if (monitorRef.current) {
      const finalMetrics = monitorRef.current.stop();
      updateMetrics(id, finalMetrics);
    }
  };

  const resetTest = () => {
    stopTest();
    setProgress(0);
    setFinalMessage('');
    renderCountRef.current = 0;
    currentMessageRef.current = '';
    updateMessage(id, '');
    
    if (messageContainerRef.current) {
      messageContainerRef.current.textContent = '';
    }
    
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
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
            Method 3: Manual DOM
          </h3>
          <p className="text-sm text-gray-600">
            Direct DOM manipulation
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Renders: {renderCountRef.current}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
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
            {/* During typing, content is managed by direct DOM manipulation */}
            {/* After completion, show the final message through React */}
            {!isRunning && finalMessage}
            
            {/* Container for manual DOM updates during typing */}
            <span 
              ref={messageContainerRef}
              className={isRunning ? '' : 'hidden'}
            />
            
            {/* Animated cursor */}
            <span 
              ref={cursorRef}
              className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse"
              style={{ display: 'none' }}
            />
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
          Start Test
        </button>
        
        <button
          onClick={stopTest}
          disabled={!isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
        
        <button
          onClick={resetTest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Performance Info */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-md">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Performance Characteristics:</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• Bypasses React rendering during typing</li>
          <li>• Minimal re-renders (only progress updates)</li>
          <li>• Best performance but loses React benefits</li>
          <li>• Single setState call at completion</li>
        </ul>
      </div>
    </div>
  );
};

export default Method3ManualDOM;