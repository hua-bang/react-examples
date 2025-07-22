import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Activity, Cpu, MemoryStick, Clock, Zap, Monitor } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const PerformancePanel: React.FC = () => {
  const { t } = useTranslation();
  const { currentMetrics } = useAppStore();

  // Transform metrics data for charts
  const chartData = useMemo(() => {
    return Object.entries(currentMetrics).map(([method, metrics]) => ({
      method: method.replace('method', 'M'),
      renderCount: metrics.renderCount,
      memoryUsage: Math.round(metrics.memoryUsage * 100) / 100,
      cpuUsage: Math.round(metrics.cpuUsage * 100) / 100,
      firstRenderTime: Math.round(metrics.firstRenderTime * 100) / 100,
      completeRenderTime: Math.round(metrics.completeRenderTime * 100) / 100,
      interactionDelay: Math.round(metrics.interactionDelay * 100) / 100,
    }));
  }, [currentMetrics]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toFixed(1);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      method1: '#ef4444', // red
      method2: '#22c55e', // green
      method3: '#f59e0b', // yellow
      method4: '#8b5cf6', // purple
    };
    return colors[method as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold">{t('performance.title')}</h2>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(currentMetrics).map(([method, metrics]) => (
          <div key={method} className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">
              {method.replace('method', 'Method ')}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Monitor className="w-3 h-3 text-blue-400" />
                <span className="text-xs">Renders:</span>
                <span className="text-sm font-mono text-white">
                  {metrics.renderCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MemoryStick className="w-3 h-3 text-green-400" />
                <span className="text-xs">Memory:</span>
                <span className="text-sm font-mono text-white">
                  {formatNumber(metrics.memoryUsage)}MB
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-yellow-400" />
                <span className="text-xs">CPU:</span>
                <span className="text-sm font-mono text-white">
                  {formatNumber(metrics.cpuUsage)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Render Count Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium">{t('performance.renderCount')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="method" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                <Bar 
                  dataKey="renderCount" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Usage Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MemoryStick className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-medium">{t('performance.memoryUsage')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="method" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                <Bar 
                  dataKey="memoryUsage" 
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Timing Metrics Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-medium">{t('performance.timingMetrics')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="method" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="firstRenderTime" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="First Render"
                />
                <Line 
                  type="monotone" 
                  dataKey="interactionDelay" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Interaction Delay"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CPU Usage Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium">{t('performance.cpuUsage')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="method" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                <Bar 
                  dataKey="cpuUsage" 
                  fill="#ef4444"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {chartData.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium">{t('performance.summary')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400">{t('performance.lowestRenderCount')}:</span>
              <div className="font-mono text-green-400">
                {chartData.reduce((min, item) => 
                  item.renderCount < min.renderCount ? item : min
                ).method} ({chartData.reduce((min, item) => 
                  Math.min(min, item.renderCount), Infinity
                )})
              </div>
            </div>
            <div>
              <span className="text-gray-400">{t('performance.lowestMemoryUsage')}:</span>
              <div className="font-mono text-green-400">
                {chartData.reduce((min, item) => 
                  item.memoryUsage < min.memoryUsage ? item : min
                ).method} ({formatNumber(chartData.reduce((min, item) => 
                  Math.min(min, item.memoryUsage), Infinity
                ))}MB)
              </div>
            </div>
            <div>
              <span className="text-gray-400">{t('performance.fastestFirstRender')}:</span>
              <div className="font-mono text-green-400">
                {chartData.reduce((min, item) => 
                  item.firstRenderTime < min.firstRenderTime ? item : min
                ).method} ({formatNumber(chartData.reduce((min, item) => 
                  Math.min(min, item.firstRenderTime), Infinity
                ))}ms)
              </div>
            </div>
            <div>
              <span className="text-gray-400">{t('performance.lowestCpuUsage')}:</span>
              <div className="font-mono text-green-400">
                {chartData.reduce((min, item) => 
                  item.cpuUsage < min.cpuUsage ? item : min
                ).method} ({formatNumber(chartData.reduce((min, item) => 
                  Math.min(min, item.cpuUsage), Infinity
                ))}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('performance.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;