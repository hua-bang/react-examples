import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const ResultsComparison: React.FC = () => {
  const { t } = useTranslation();
  const { testResults } = useAppStore();

  // Transform results for comparison
  const comparisonData = useMemo(() => {
    return Object.entries(testResults).map(([method, results]) => {
      if (results.length === 0) return null;
      
      // Calculate averages
      const avgMetrics = results.reduce((acc, result) => {
        acc.renderCount += result.metrics.renderCount;
        acc.memoryUsage += result.metrics.memoryUsage;
        acc.cpuUsage += result.metrics.cpuUsage;
        acc.firstRenderTime += result.metrics.firstRenderTime;
        acc.completeRenderTime += result.metrics.completeRenderTime;
        acc.interactionDelay += result.metrics.interactionDelay;
        return acc;
      }, {
        renderCount: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        firstRenderTime: 0,
        completeRenderTime: 0,
        interactionDelay: 0,
      });

      const count = results.length;
      return {
        method: method.replace('method', 'Method '),
        methodKey: method,
        renderCount: Math.round(avgMetrics.renderCount / count),
        memoryUsage: Math.round((avgMetrics.memoryUsage / count) * 100) / 100,
        cpuUsage: Math.round((avgMetrics.cpuUsage / count) * 100) / 100,
        firstRenderTime: Math.round((avgMetrics.firstRenderTime / count) * 100) / 100,
        completeRenderTime: Math.round((avgMetrics.completeRenderTime / count) * 100) / 100,
        interactionDelay: Math.round((avgMetrics.interactionDelay / count) * 100) / 100,
        iterations: count,
      };
    }).filter(Boolean);
  }, [testResults]);

  // Calculate performance scores (lower is better for most metrics)
  const performanceScores = useMemo(() => {
    if (comparisonData.length === 0) return [];

    const maxValues = comparisonData.reduce((max, item) => ({
      renderCount: Math.max(max.renderCount, item!.renderCount),
      memoryUsage: Math.max(max.memoryUsage, item!.memoryUsage),
      cpuUsage: Math.max(max.cpuUsage, item!.cpuUsage),
      firstRenderTime: Math.max(max.firstRenderTime, item!.firstRenderTime),
      interactionDelay: Math.max(max.interactionDelay, item!.interactionDelay),
    }), {
      renderCount: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      firstRenderTime: 0,
      interactionDelay: 0,
    });

    return comparisonData.map(item => {
      if (!item) return null;
      
      // Calculate normalized scores (0-100, higher is better)
      const renderScore = maxValues.renderCount > 0 ? 
        Math.round((1 - item.renderCount / maxValues.renderCount) * 100) : 100;
      const memoryScore = maxValues.memoryUsage > 0 ? 
        Math.round((1 - item.memoryUsage / maxValues.memoryUsage) * 100) : 100;
      const cpuScore = maxValues.cpuUsage > 0 ? 
        Math.round((1 - item.cpuUsage / maxValues.cpuUsage) * 100) : 100;
      const speedScore = maxValues.firstRenderTime > 0 ? 
        Math.round((1 - item.firstRenderTime / maxValues.firstRenderTime) * 100) : 100;
      const responsiveScore = maxValues.interactionDelay > 0 ? 
        Math.round((1 - item.interactionDelay / maxValues.interactionDelay) * 100) : 100;
      
      const overallScore = Math.round(
        (renderScore + memoryScore + cpuScore + speedScore + responsiveScore) / 5
      );

      return {
        ...item,
        renderScore,
        memoryScore,
        cpuScore,
        speedScore,
        responsiveScore,
        overallScore,
      };
    }).filter(Boolean);
  }, [comparisonData]);

  // Radar chart data
  const radarData = useMemo(() => {
    return performanceScores.map(item => ({
      method: item!.method,
      'Render Efficiency': item!.renderScore,
      'Memory Efficiency': item!.memoryScore,
      'CPU Efficiency': item!.cpuScore,
      'Speed': item!.speedScore,
      'Responsiveness': item!.responsiveScore,
    }));
  }, [performanceScores]);

  const getMethodColor = (methodKey: string) => {
    const colors = {
      method1: '#ef4444', // red
      method2: '#22c55e', // green
      method3: '#f59e0b', // yellow
      method4: '#8b5cf6', // purple
    };
    return colors[methodKey as keyof typeof colors] || '#6b7280';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { icon: Award, text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 75) return { icon: CheckCircle, text: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { icon: TrendingUp, text: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { icon: AlertTriangle, text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  if (comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">{t('results.title')}</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('results.noResults')}</p>
          <p className="text-sm">{t('results.runTestsDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Results Comparison</h2>
      </div>

      {/* Performance Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {performanceScores.map((item) => {
          if (!item) return null;
          const badge = getScoreBadge(item.overallScore);
          const IconComponent = badge.icon;
          
          return (
            <div key={item.methodKey} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">{item.method}</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {badge.text}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: getMethodColor(item.methodKey) }}>
                {item.overallScore}
              </div>
              <div className="text-xs text-gray-500">{t('results.overallScore')}</div>
              <div className="mt-2 text-xs text-gray-600">
                {item.iterations} {item.iterations === 1 ? t('results.iterations') : t('results.iterationsPlural')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Metrics Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Render Count Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('results.renderCountComparison')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="method" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
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

        {/* Memory Usage Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('results.memoryUsageComparison')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="method" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
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
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('results.performanceRadar')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis tick={{ fontSize: 12 }} />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10 }}
            />
            {performanceScores.map((item, index) => (
              <Radar
                key={item!.methodKey}
                name={item!.method}
                dataKey={item!.method}
                stroke={getMethodColor(item!.methodKey)}
                fill={getMethodColor(item!.methodKey)}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('results.detailedMetrics')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">{t('results.method')}</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Renders</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Memory (MB)</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">CPU (%)</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">First Render (ms)</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Interaction (ms)</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Score</th>
              </tr>
            </thead>
            <tbody>
              {performanceScores.map((item) => {
                if (!item) return null;
                return (
                  <tr key={item.methodKey} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getMethodColor(item.methodKey) }}
                      ></span>
                      {item.method}
                    </td>
                    <td className="text-right py-2 px-3 font-mono">{item.renderCount}</td>
                    <td className="text-right py-2 px-3 font-mono">{item.memoryUsage}</td>
                    <td className="text-right py-2 px-3 font-mono">{item.cpuUsage}</td>
                    <td className="text-right py-2 px-3 font-mono">{item.firstRenderTime}</td>
                    <td className="text-right py-2 px-3 font-mono">{item.interactionDelay}</td>
                    <td className={`text-right py-2 px-3 font-bold ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Summary */}
      {performanceScores.length > 1 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-800">{t('results.performanceWinner')}</h3>
          </div>
          {(() => {
            const winner = performanceScores.reduce((best, current) => 
              current!.overallScore > best!.overallScore ? current : best
            );
            return (
              <p className="text-sm text-blue-700">
                <strong>{winner!.method}</strong> achieved the highest overall performance score of{' '}
                <strong>{winner!.overallScore}</strong> points, making it the most efficient method
                for this test configuration.
              </p>
            );
          })()} 
        </div>
      )}
    </div>
  );
};

export default ResultsComparison;