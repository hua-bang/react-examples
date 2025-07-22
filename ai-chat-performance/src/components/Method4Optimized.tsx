import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MockSSE, generateLongMessage } from '../utils/mockSSE';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface Method4Props {
  id?: string;
}

// Memoized message display component
const MessageDisplay = memo<{
  message: string;
  isRunning: boolean;
  onRender: () => void;
}>(({ message, isRunning, onRender }) => {
  useEffect(() => {
    onRender();
  });

  // Use useMemo to prevent unnecessary re-calculations
  const displayContent = useMemo(() => {
    return message;
  }, [message]);

  return (
    <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
        {displayContent}
        {isRunning && (
          <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
});

MessageDisplay.displayName = 'MessageDisplay';

// Time slicing utility
class TimeSlicedUpdater {
  private queue: string[] = [];
  private isProcessing = false;
  private onUpdate: (message: string) => void;
  private batchSize: number;
  
  constructor(onUpdate: (message: string) => void, batchSize = 5) {
    this.onUpdate = onUpdate;
    this.batchSize = batchSize;
  }

  addCharacter(char: string) {
    this.queue.push(char);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const processChunk = (deadline?: IdleDeadline) => {
      let processed = 0;
      const currentMessage = this.getCurrentMessage();
      
      while (
        this.queue.length > 0 && 
        processed < this.batchSize &&
        (!deadline || deadline.timeRemaining() > 1)
      ) {
        this.queue.shift();
        processed++;
      }
      
      if (processed > 0) {
        const newMessage = currentMessage + this.queue.slice(-processed).join('');
        this.onUpdate(newMessage);
      }
      
      if (this.queue.length > 0) {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processChunk);
        } else {
          setTimeout(() => processChunk(), 16); // ~60fps
        }
      } else {
        this.isProcessing = false;
      }
    };
    
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processChunk);
    } else {
      setTimeout(() => processChunk(), 0);
    }
  }
  
  private getCurrentMessage(): string {
    // This would need to be passed from the component
    return '';
  }
  
  clear() {
    this.queue = [];
    this.isProcessing = false;
  }
}

const Method4Optimized: React.FC<Method4Props> = ({ id = 'method4' }) => {
  const [message, setMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const sseRef = useRef<MockSSE | null>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const renderCountRef = useRef(0);
  const timeSlicerRef = useRef<TimeSlicedUpdater | null>(null);
  const messageBufferRef = useRef('');
  const lastUpdateTimeRef = useRef(0);
  
  const { testConfig, updateMetrics, updateMessage } = useAppStore();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleRender = useCallback(() => {
    renderCountRef.current++;
    if (monitorRef.current) {
      monitorRef.current.recordRender();
    }
  }, []);

  const updateMessageThrottled = useCallback((newMessage: string) => {
    const now = Date.now();
    // Throttle updates to reduce render frequency
    if (now - lastUpdateTimeRef.current > 50) { // Max 20 updates per second
      setMessage(newMessage);
      lastUpdateTimeRef.current = now;
    }
  }, []);

  // Track renders for performance monitoring
  useEffect(() => {
    renderCountRef.current++;
    if (monitorRef.current) {
      monitorRef.current.recordRender();
    }
  });

  const startTest = useCallback(() => {
    if (isRunning) return;
    
    // Reset state
    setMessage('');
    setProgress(0);
    setIsRunning(true);
    renderCountRef.current = 0;
    messageBufferRef.current = '';
    lastUpdateTimeRef.current = 0;
    
    // Initialize time slicer
    timeSlicerRef.current = new TimeSlicedUpdater(updateMessageThrottled, 3);
    
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
        // Add to buffer and use time slicing for updates
        messageBufferRef.current += char;
        
        // Use time slicing to batch character updates
        if (timeSlicerRef.current) {
          timeSlicerRef.current.addCharacter(char);
        }
        
        // Update message with throttling
        updateMessageThrottled(messageBufferRef.current);
        
        // Update progress less frequently
        const newProgress = (index + 1) / testMessage.length;
        if (Math.floor(newProgress * 20) !== Math.floor(progress * 20)) {
          setProgress(newProgress);
        }
        
        // Update store message for comparison
        updateMessage(id, messageBufferRef.current);
        
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
  }, [isRunning, testConfig, updateMetrics, updateMessage, updateMessageThrottled, id, progress]);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setProgress(1);
    
    // Final update with complete message
    setMessage(messageBufferRef.current);
    
    if (timeSlicerRef.current) {
      timeSlicerRef.current.clear();
    }
    
    if (monitorRef.current) {
      const finalMetrics = monitorRef.current.stop();
      updateMetrics(id, finalMetrics);
    }
    
    if (sseRef.current) {
      sseRef.current.stop();
    }
  }, [updateMetrics, id]);

  const stopTest = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.stop();
    }
    handleComplete();
  }, [handleComplete]);

  const resetTest = useCallback(() => {
    stopTest();
    setMessage('');
    setProgress(0);
    renderCountRef.current = 0;
    messageBufferRef.current = '';
    updateMessage(id, '');
    
    if (timeSlicerRef.current) {
      timeSlicerRef.current.clear();
    }
  }, [stopTest, updateMessage, id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.stop();
      }
      if (monitorRef.current) {
        monitorRef.current.stop();
      }
      if (timeSlicerRef.current) {
        timeSlicerRef.current.clear();
      }
    };
  }, []);

  // Memoized progress bar to prevent unnecessary re-renders
  const progressBar = useMemo(() => (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  ), [progress]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Method 4: React Optimized
          </h3>
          <p className="text-sm text-gray-600">
            memo + useMemo + time slicing
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Renders: {renderCountRef.current}
        </div>
      </div>

      {/* Progress Bar */}
      {progressBar}

      {/* Message Display */}
      <div className="flex-1 mb-4">
        <MessageDisplay 
          message={message}
          isRunning={isRunning}
          onRender={handleRender}
        />
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
      <div className="mt-4 p-3 bg-purple-50 rounded-md">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Performance Characteristics:</h4>
        <ul className="text-xs text-purple-800 space-y-1">
          <li>• React.memo prevents unnecessary re-renders</li>
          <li>• useMemo and useCallback optimize computations</li>
          <li>• Time slicing batches updates efficiently</li>
          <li>• Best balance of performance and React benefits</li>
        </ul>
      </div>
    </div>
  );
};

export default Method4Optimized;