import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parse } from 'date-fns';
import { KofiaMarginRow } from '../types';
import { TrendingUp, TrendingDown, Building2, Wallet, Coins } from 'lucide-react';

interface Props {
  data: KofiaMarginRow[];
}

const formatTrillion = (amountInMillion: number): string => {
  if (amountInMillion == null || isNaN(amountInMillion)) return '-';
  const trillion = amountInMillion / 1000000;
  return `₩${trillion.toFixed(2)}T`;
};

const formatDetailedKRW = (amountInMillion: number): string => {
  if (amountInMillion == null || isNaN(amountInMillion)) return '-';
  const trillion = (amountInMillion / 1000000).toFixed(2);
  const billion = Math.round(amountInMillion / 100).toLocaleString();
  return `₩${trillion}T (₩${billion}B)`;
};

interface MetricChartConfig {
  id: 'kospi' | 'kosdaq' | 'deposit';
  title: string;
  subtitle: string;
  dataKey: 'TMPV3' | 'TMPV4' | 'TMPV9';
  pctKey: 'TMPV3_pct' | 'TMPV4_pct' | 'TMPV9_pct';
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ElementType;
}

const METRIC_CONFIGS: MetricChartConfig[] = [
  {
    id: 'kospi',
    title: 'KOSPI Margin Balance',
    subtitle: 'KOSPI (유가증권) 신용융자 잔고',
    dataKey: 'TMPV3',
    pctKey: 'TMPV3_pct',
    color: '#2563eb',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'KOSPI',
    icon: Building2,
  },
  {
    id: 'kosdaq',
    title: 'KOSDAQ Margin Balance',
    subtitle: 'KOSDAQ (코스닥) 신용융자 잔고',
    dataKey: 'TMPV4',
    pctKey: 'TMPV4_pct',
    color: '#059669',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'KOSDAQ',
    icon: Wallet,
  },
  {
    id: 'deposit',
    title: 'Customer Deposits',
    subtitle: '고객예탁금 (증시 대기 자금)',
    dataKey: 'TMPV9',
    pctKey: 'TMPV9_pct',
    color: '#9333ea',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'DEPOSITS',
    icon: Coins,
  },
];

export const MarginBalanceChart: React.FC<Props> = ({ data }) => {
  const [displayMode, setDisplayMode] = useState<'amount' | 'percent'>('amount');
  const [selectedTab, setSelectedTab] = useState<'all' | 'kospi' | 'kosdaq' | 'deposit'>('all');

  // Chronologically sorted data (oldest to newest)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => a.TMPV1.localeCompare(b.TMPV1));
  }, [data]);

  // Normalized % Change Data (relative to start of 6-month period)
  const chartData = useMemo(() => {
    if (sortedData.length === 0) return [];
    const base = sortedData[0];
    return sortedData.map((row) => ({
      ...row,
      TMPV3_pct: base.TMPV3 ? ((row.TMPV3 - base.TMPV3) / base.TMPV3) * 100 : 0,
      TMPV4_pct: base.TMPV4 ? ((row.TMPV4 - base.TMPV4) / base.TMPV4) * 100 : 0,
      TMPV9_pct: base.TMPV9 && row.TMPV9 ? ((row.TMPV9 - base.TMPV9) / base.TMPV9) * 100 : 0,
    }));
  }, [sortedData]);

  // Latest date string
  const latestDateStr = useMemo(() => {
    if (sortedData.length === 0) return '';
    const latest = sortedData[sortedData.length - 1];
    return format(parse(latest.TMPV1, 'yyyyMMdd', new Date()), 'MMM dd, yyyy');
  }, [sortedData]);

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No margin balance data available.</p>
      </div>
    );
  }

  const activeConfigs = METRIC_CONFIGS.filter(
    (cfg) => selectedTab === 'all' || selectedTab === cfg.id
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              KOFIA Margin Trading
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
              Last 6 Months
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            Individual Market Margin & Deposit Charts
          </p>
          <p className="text-xs text-gray-400 mt-1">
            As of: {latestDateStr}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Filter Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold text-gray-600">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              All Charts (3)
            </button>
            <button
              onClick={() => setSelectedTab('kospi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'kospi'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              KOSPI
            </button>
            <button
              onClick={() => setSelectedTab('kosdaq')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'kosdaq'
                  ? 'bg-white text-emerald-600 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              KOSDAQ
            </button>
            <button
              onClick={() => setSelectedTab('deposit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'deposit'
                  ? 'bg-white text-purple-600 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Deposits
            </button>
          </div>

          {/* Display Mode Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold text-gray-600">
            <button
              onClick={() => setDisplayMode('amount')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                displayMode === 'amount'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Amount (KRW)
            </button>
            <button
              onClick={() => setDisplayMode('percent')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                displayMode === 'percent'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              % Change
            </button>
          </div>
        </div>
      </div>

      {/* Render Individual Charts */}
      <div className="flex flex-col gap-8">
        {activeConfigs.map((config) => (
          <IndividualMetricCard
            key={config.id}
            config={config}
            sortedData={sortedData}
            chartData={chartData}
            displayMode={displayMode}
          />
        ))}
      </div>
    </div>
  );
};

interface IndividualMetricCardProps {
  config: MetricChartConfig;
  sortedData: KofiaMarginRow[];
  chartData: any[];
  displayMode: 'amount' | 'percent';
}

const IndividualMetricCard: React.FC<IndividualMetricCardProps> = ({
  config,
  sortedData,
  chartData,
  displayMode,
}) => {
  const Icon = config.icon;
  const activeKey = displayMode === 'amount' ? config.dataKey : config.pctKey;

  // Metric Stats Calculation
  const stats = useMemo(() => {
    if (sortedData.length === 0) return null;

    const latestRow = sortedData[sortedData.length - 1];
    const prevRow = sortedData.length > 1 ? sortedData[sortedData.length - 2] : latestRow;
    const startRow = sortedData[0];

    const latestVal = latestRow[config.dataKey] || 0;
    const prevVal = prevRow[config.dataKey] || 0;
    const startVal = startRow[config.dataKey] || 0;

    const dayDiff = latestVal - prevVal;
    const dayDiffPct = prevVal ? ((latestVal - prevVal) / prevVal) * 100 : 0;
    const periodDiffPct = startVal ? ((latestVal - startVal) / startVal) * 100 : 0;

    const series = sortedData.map((d) => d[config.dataKey] || 0).filter((v) => v > 0);
    const maxVal = series.length > 0 ? Math.max(...series) : 0;
    const minVal = series.length > 0 ? Math.min(...series) : 0;

    return {
      latestVal,
      dayDiff,
      dayDiffPct,
      periodDiffPct,
      maxVal,
      minVal,
    };
  }, [sortedData, config]);

  // Dedicated Tight Y-Domain
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];

    const values: number[] = chartData
      .map((row) => row[activeKey])
      .filter((v) => v != null && !isNaN(v));

    if (values.length === 0) return ['auto', 'auto'];

    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const diff = maxV - minV || 1;
    const padding = diff * 0.08; // 8% padding for maximum vertical curve visualization

    return [
      displayMode === 'amount' ? Math.max(0, minV - padding) : minV - padding,
      maxV + padding,
    ];
  }, [chartData, activeKey, displayMode]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header & Stat Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-gray-900">{config.title}</h4>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${config.badgeBg}`}
              >
                {config.badgeText}
              </span>
            </div>
            <p className="text-xs text-gray-400">{config.subtitle}</p>
          </div>
        </div>

        {/* Live Metrics Row */}
        {stats && (
          <div className="flex flex-wrap items-center gap-6 text-xs">
            {/* Latest Value */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Current Value
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatTrillion(stats.latestVal)}
              </span>
            </div>

            {/* Daily Change */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                vs Prev Day
              </span>
              <div className="flex items-center gap-1 font-bold">
                {stats.dayDiff >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                    +{formatTrillion(stats.dayDiff)} (+{stats.dayDiffPct.toFixed(2)}%)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                    {formatTrillion(stats.dayDiff)} ({stats.dayDiffPct.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>

            {/* 6M Range */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                6M High / Low
              </span>
              <span className="font-semibold text-slate-700">
                {formatTrillion(stats.maxVal)} / {formatTrillion(stats.minVal)}
              </span>
            </div>

            {/* 6M Trend */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                6M Total Trend
              </span>
              <span
                className={`font-bold ${
                  stats.periodDiffPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stats.periodDiffPct >= 0 ? '+' : ''}
                {stats.periodDiffPct.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-[320px] md:h-[360px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="TMPV1"
              tickFormatter={(t) => format(parse(t, 'yyyyMMdd', new Date()), 'MMM dd')}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              minTickGap={35}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              domain={yDomain as any}
              tickFormatter={(val) => {
                if (displayMode === 'percent') {
                  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
                }
                return `₩${(val / 1000000).toFixed(1)}T`;
              }}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const formattedDate = format(
                  parse(label as string, 'yyyyMMdd', new Date()),
                  'MMM dd, yyyy (EEE)'
                );
                const rawVal = payload[0].payload[config.dataKey];
                const pctVal = payload[0].payload[config.pctKey];

                return (
                  <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                    <p className="font-bold text-slate-400 text-[10px] uppercase border-b border-slate-100 pb-1">
                      {formattedDate}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="font-bold text-slate-800">{config.title}</span>
                    </div>
                    <div className="text-right pt-1">
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {formatDetailedKRW(rawVal)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold block ${
                          pctVal >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {pctVal >= 0 ? '+' : ''}
                        {pctVal.toFixed(2)}% (vs 6M Start)
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              name={config.title}
              type="monotone"
              dataKey={activeKey}
              stroke={config.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
