import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MockSSE, generateLongMessage } from '../utils/mockSSE';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface Method2Props {
  id?: string;
}

// Separate component that will be rendered in portal
const PortalChatComponent: React.FC<{
  message: string;
  isRunning: boolean;
  onRenderCount: () => void;
}> = ({ message, isRunning, onRenderCount }) => {
  useEffect(() => {
    onRenderCount();
  });

  return (
    <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
        {message}
        {isRunning && (
          <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};

const Method2CreatePortal: React.FC<Method2Props> = ({ id = 'method2' }) => {
  const [message, setMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  
  const sseRef = useRef<MockSSE | null>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const renderCountRef = useRef(0);
  const portalRenderCountRef = useRef(0);
  
  const { testConfig, updateMetrics, updateMessage } = useAppStore();

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.id = `portal-container-${id}`;
    container.style.height = '100%';
    setPortalContainer(container);
    
    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [id]);

  // Track renders for performance monitoring
  useEffect(() => {
    renderCountRef.current++;
    if (monitorRef.current) {
      monitorRef.current.recordRender();
    }
  });

  const handlePortalRender = () => {
    portalRenderCountRef.current++;
    if (monitorRef.current) {
      monitorRef.current.recordRender();
    }
  };

  const startTest = () => {
    if (isRunning) return;
    
    // Reset state
    setMessage('');
    setProgress(0);
    setIsRunning(true);
    renderCountRef.current = 0;
    portalRenderCountRef.current = 0;
    
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
        // setState still happens on every character, but portal isolates the rendering
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
    portalRenderCountRef.current = 0;
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
            Method 2: createPortal
          </h3>
          <p className="text-sm text-gray-600">
            Isolated rendering context
          </p>
        </div>
        <div className="text-xs text-gray-500">
          <div>Main: {renderCountRef.current}</div>
          <div>Portal: {portalRenderCountRef.current}</div>
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

      {/* Message Display - Portal Container */}
      <div className="flex-1 mb-4">
        <div ref={(el) => {
          if (el && portalContainer && !el.contains(portalContainer)) {
            el.appendChild(portalContainer);
          }
        }}>
          {portalContainer && createPortal(
            <PortalChatComponent 
              message={message}
              isRunning={isRunning}
              onRenderCount={handlePortalRender}
            />,
            portalContainer
          )}
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
      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <h4 className="text-sm font-medium text-green-900 mb-2">Performance Characteristics:</h4>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Isolates chat rendering from parent component</li>
          <li>• Reduces parent component re-renders</li>
          <li>• Still has frequent setState calls</li>
          <li>• Better than Method 1 but not optimal</li>
        </ul>
      </div>
    </div>
  );
};

export default Method2CreatePortal;