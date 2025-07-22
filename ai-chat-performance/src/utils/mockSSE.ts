export interface SSEConfig {
  message: string;
  speed: number; // characters per second
  onData: (char: string, index: number, isComplete: boolean) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class MockSSE {
  private intervalId: number | null = null;
  private timeoutId: number | null = null;
  private currentIndex = 0;
  private isRunning = false;

  private config: SSEConfig;
  
  constructor(config: SSEConfig) {
    this.config = config;
  }

  start(): void {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.currentIndex = 0;
    const { message, speed, onData, onComplete } = this.config;
    const intervalMs = 1000 / speed;

    const sendNextChar = () => {
      if (!this.isRunning || this.currentIndex >= message.length) {
        this.stop();
        const isComplete = this.currentIndex >= message.length;
        if (isComplete && onComplete) {
          onComplete();
        }
        return;
      }

      const char = message[this.currentIndex];
      const isComplete = this.currentIndex === message.length - 1;
      
      try {
        onData(char, this.currentIndex, isComplete);
      } catch (error) {
        if (this.config.onError) {
          this.config.onError(error as Error);
        }
        this.stop();
        return;
      }

      this.currentIndex++;
      
      if (this.isRunning) {
        this.timeoutId = window.setTimeout(sendNextChar, intervalMs);
      }
    };

    // Start immediately
    sendNextChar();
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getProgress(): number {
    return this.config.message.length > 0 
      ? this.currentIndex / this.config.message.length 
      : 0;
  }
}

// Generate sample long message for testing
export const generateLongMessage = (length: number): string => {
  const sentences = [
    "This is a comprehensive performance evaluation of different typewriter effect implementations in React applications.",
    "We are testing how various approaches handle frequent state updates and component re-renders.",
    "The direct setState approach triggers re-renders on every character, which can cause performance bottlenecks.",
    "Using createPortal helps isolate rendering contexts but still suffers from frequent state updates.",
    "Manual DOM manipulation bypasses React's rendering cycle entirely, offering better performance at the cost of React benefits.",
    "The optimized approach combines React.memo, useMemo, useCallback, and time slicing for the best balance.",
    "Performance metrics include render count, memory usage, CPU utilization, and user interaction responsiveness.",
    "These tests help developers choose the right implementation strategy for their specific use cases.",
    "Long messages like this one are particularly challenging for real-time rendering systems.",
    "The goal is to maintain smooth user experience while efficiently handling large amounts of streaming text data."
  ];
  
  let result = "";
  let currentLength = 0;
  
  while (currentLength < length) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (currentLength + sentence.length <= length) {
      result += sentence + " ";
      currentLength += sentence.length + 1;
    } else {
      // Add partial sentence to reach exact length
      const remaining = length - currentLength;
      result += sentence.substring(0, remaining);
      break;
    }
  }
  
  return result.trim();
};