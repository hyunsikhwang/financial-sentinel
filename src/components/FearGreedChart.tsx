import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { FearGreedData } from '../types';

interface Props {
  data: FearGreedData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-xs text-gray-500 mb-1">{format(new Date(label), 'MMM dd, yyyy')}</p>
        <p className="text-lg font-bold text-gray-900 leading-none">
          {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export const FearGreedChart: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.x,
      value: d.y,
    }));
  }, [data]);

  const latestValue = chartData[chartData.length - 1]?.value || 0;

  const sentiment = useMemo(() => {
    if (latestValue <= 25) return { label: 'Extreme Fear', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', chartFill: '#ef4444' };
    if (latestValue <= 45) return { label: 'Fear', color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', chartFill: '#f97316' };
    if (latestValue <= 55) return { label: 'Neutral', color: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', chartFill: '#eab308' };
    if (latestValue <= 75) return { label: 'Greed', color: '#16a34a', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', chartFill: '#16a34a' };
    return { label: 'Extreme Greed', color: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', chartFill: '#2563eb' };
  }, [latestValue]);

  if (chartData.length === 0) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No sentiment data available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Index Overview</h3>
          <div className="flex items-center gap-4">
            <div className={`px-5 py-2 rounded-2xl ${sentiment.bg} ${sentiment.border} border shadow-sm transition-all duration-500`}>
              <span className={`text-6xl font-black tracking-tighter ${sentiment.text}`}>
                {latestValue.toFixed(0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold tracking-tight ${sentiment.text}`}>
                {sentiment.label}
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wide">Market Momentum</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="px-3 py-1 bg-black rounded-lg text-[9px] font-extrabold text-white uppercase tracking-widest mb-3">
            Real-time Feed
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sync: Daily</p>
        </div>
      </div>

      <div className="h-[450px] w-full relative" id="fear-greed-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <filter id="shadow" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="4" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.1" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM')}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
              dy={15}
              boundaryGap={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              ticks={[0, 25, 45, 55, 75, 100]}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* @ts-ignore */}
            <ReferenceArea y1={0} y2={25} fill="#ef4444" fillOpacity={0.15} />
            {/* @ts-ignore */}
            <ReferenceArea y1={25} y2={45} fill="#f97316" fillOpacity={0.15} />
            {/* @ts-ignore */}
            <ReferenceArea y1={45} y2={55} fill="#facc15" fillOpacity={0.15} />
            {/* @ts-ignore */}
            <ReferenceArea y1={55} y2={75} fill="#22c55e" fillOpacity={0.15} />
            {/* @ts-ignore */}
            <ReferenceArea y1={75} y2={100} fill="#3b82f6" fillOpacity={0.15} />

            <ReferenceLine y={50} stroke="#e2e8f0" strokeWidth={1} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#334155"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={2000}
              filter="url(#shadow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-5 gap-4">
        <div className="group transition-all duration-300">
          <div className="h-1.5 w-full bg-red-500/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full w-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ext. Fear</span>
          <span className="block text-xs font-bold text-gray-900 leading-none">0 — 25</span>
        </div>
        <div className="group transition-all duration-300">
          <div className="h-1.5 w-full bg-orange-500/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full w-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Fear</span>
          <span className="block text-xs font-bold text-gray-900 leading-none">25 — 45</span>
        </div>
        <div className="group transition-all duration-300">
          <div className="h-1.5 w-full bg-yellow-500/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full w-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Neutral</span>
          <span className="block text-xs font-bold text-gray-900 leading-none">45 — 55</span>
        </div>
        <div className="group transition-all duration-300">
          <div className="h-1.5 w-full bg-green-500/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full w-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Greed</span>
          <span className="block text-xs font-bold text-gray-900 leading-none">55 — 75</span>
        </div>
        <div className="group transition-all duration-300">
          <div className="h-1.5 w-full bg-blue-500/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full w-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ext. Greed</span>
          <span className="block text-xs font-bold text-gray-900 leading-none">75 — 100</span>
        </div>
      </div>
    </div>

  );
};
