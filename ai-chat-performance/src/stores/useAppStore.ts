import { create } from 'zustand';
import { PerformanceMetrics, TestConfig, TestResult } from '../types';

interface AppState {
  // Test configuration
  testConfig: TestConfig;
  setTestConfig: (config: Partial<TestConfig>) => void;
  updateTestConfig: (config: Partial<TestConfig>) => void;

  // Current test state
  isTestRunning: boolean;
  isRunning: boolean;
  currentMethod: string | null;
  setTestRunning: (running: boolean, method?: string) => void;
  startTest: () => void;
  stopTest: () => void;
  resetResults: () => void;

  // Performance metrics
  currentMetrics: Record<string, PerformanceMetrics>;
  updateMetrics: (method: string, metrics: Partial<PerformanceMetrics>) => void;
  resetMetrics: () => void;

  // Test results
  testResults: Record<string, TestResult[]>;
  addTestResult: (result: TestResult) => void;
  clearResults: () => void;

  // Messages
  messages: Record<string, string>;
  updateMessage: (method: string, message: string) => void;
  clearMessages: () => void;
}

const defaultTestConfig: TestConfig = {
  messageLength: 1000,
  typingSpeed: 50,
  testRounds: 3,
  samplingRate: 100,
  enabledMethods: ['method1', 'method2', 'method3', 'method4'],
  autoStartDelay: 1000,
  batchSize: 10,
  iterations: 5,
};

const defaultMetrics: PerformanceMetrics = {
  renderCount: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  firstRenderTime: 0,
  completeRenderTime: 0,
  interactionDelay: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Test configuration
  testConfig: defaultTestConfig,
  setTestConfig: (config) =>
    set((state) => ({
      testConfig: { ...state.testConfig, ...config }
    })),
  updateTestConfig: (config) =>
    set((state) => ({
      testConfig: { ...state.testConfig, ...config }
    })),

  // Current test state
  isTestRunning: false,
  isRunning: false,
  currentMethod: null,
  setTestRunning: (running, method) =>
    set({
      isTestRunning: running,
      isRunning: running,
      currentMethod: running ? method || null : null
    }),
  startTest: () => set({ isTestRunning: true, isRunning: true }),
  stopTest: () => set({ isTestRunning: false, isRunning: false, currentMethod: null }),
  resetResults: () => set({ testResults: {}, currentMetrics: {} }),

  // Performance metrics
  currentMetrics: {},
  updateMetrics: (method, metrics) =>
    set((state) => ({
      currentMetrics: {
        ...state.currentMetrics,
        [method]: {
          ...defaultMetrics,
          ...state.currentMetrics[method],
          ...metrics,
        },
      },
    })),
  resetMetrics: () => set({ currentMetrics: {} }),

  // Test results
  testResults: {},
  addTestResult: (result) =>
    set((state) => ({
      testResults: {
        ...state.testResults,
        [result.method]: [...(state.testResults[result.method] || []), result]
      }
    })),
  clearResults: () => set({ testResults: {} }),

  // Messages
  messages: {},
  updateMessage: (method, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [method]: message,
      },
    })),
  clearMessages: () => set({ messages: {} }),
}));