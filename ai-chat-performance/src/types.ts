export interface PerformanceMetrics {
  renderCount: number;
  memoryUsage: number;
  cpuUsage: number;
  firstRenderTime: number;
  completeRenderTime: number;
  interactionDelay: number;
}

export interface TestConfig {
  messageLength: number;
  typingSpeed: number; // characters per second
  testRounds: number;
  samplingRate: number; // ms
  enabledMethods: string[];
  autoStartDelay: number;
  batchSize: number;
  iterations: number;
}

export interface TestResult {
  id: string;
  method: string;
  config: TestConfig;
  metrics: PerformanceMetrics;
  timestamp: number;
}