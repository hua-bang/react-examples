import { PerformanceMetrics } from '../types';

export class PerformanceMonitor {
  private startTime: number = 0;
  private renderCount: number = 0;
  private firstRenderTime: number = 0;
  private memoryBaseline: number = 0;
  private isMonitoring: boolean = false;
  private intervalId: number | null = null;
  private onUpdate?: (metrics: Partial<PerformanceMetrics>) => void;

  constructor(onUpdate?: (metrics: Partial<PerformanceMetrics>) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    if (this.isMonitoring) {
      this.stop();
    }

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.renderCount = 0;
    this.firstRenderTime = 0;
    this.memoryBaseline = this.getMemoryUsage();

    // Monitor performance metrics every 100ms
    this.intervalId = window.setInterval(() => {
      if (this.onUpdate) {
        this.onUpdate(this.getCurrentMetrics());
      }
    }, 100);
  }

  stop(): PerformanceMetrics {
    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    return this.getCurrentMetrics();
  }

  recordRender(): void {
    if (!this.isMonitoring) return;
    
    this.renderCount++;
    
    if (this.firstRenderTime === 0) {
      this.firstRenderTime = performance.now() - this.startTime;
    }
  }

  getCurrentMetrics(): PerformanceMetrics {
    const currentTime = performance.now();
    const completeRenderTime = this.isMonitoring ? currentTime - this.startTime : 0;
    
    return {
      renderCount: this.renderCount,
      memoryUsage: this.getMemoryUsage() - this.memoryBaseline,
      cpuUsage: this.getCPUUsage(),
      firstRenderTime: this.firstRenderTime,
      completeRenderTime,
      interactionDelay: this.measureInteractionDelay(),
    };
  }

  private getMemoryUsage(): number {
    // Use performance.memory if available (Chrome)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  private getCPUUsage(): number {
    // Estimate CPU usage based on frame timing
    // This is a simplified approach - in real applications you might use more sophisticated methods
    const start = performance.now();
    
    // Perform a small computation to measure processing time
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      sum += Math.random();
    }
    
    const end = performance.now();
    const processingTime = end - start;
    
    // Normalize to a percentage (this is a rough estimate)
    return Math.min(processingTime * 10, 100);
  }

  private measureInteractionDelay(): number {
    // Measure how long it takes to respond to a synthetic event
    // This is a simplified measurement
    const start = performance.now();
    
    // Simulate a small DOM operation
    const element = document.createElement('div');
    element.style.display = 'none';
    document.body.appendChild(element);
    document.body.removeChild(element);
    
    const end = performance.now();
    return end - start;
  }

  // Static method to create a performance observer for more detailed metrics
  static createPerformanceObserver(callback: (entries: PerformanceEntry[]) => void): PerformanceObserver | null {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        return observer;
      } catch (error) {
        console.warn('Performance observer not supported:', error);
        return null;
      }
    }
    return null;
  }

  // Utility method to measure function execution time
  static measureExecution<T>(fn: () => T, label?: string): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    if (label) {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }
}

// Hook for using performance monitor in React components
export const usePerformanceMonitor = () => {
  const monitor = new PerformanceMonitor();
  
  return {
    start: () => monitor.start(),
    stop: () => monitor.stop(),
    recordRender: () => monitor.recordRender(),
    getCurrentMetrics: () => monitor.getCurrentMetrics(),
  };
};