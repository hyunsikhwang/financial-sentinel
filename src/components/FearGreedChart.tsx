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
    if (latestValue <= 25) return { label: 'Extreme Fear', color: '#ef4444', text: 'text-red-600' };
    if (latestValue <= 45) return { label: 'Fear', color: '#f97316', text: 'text-orange-600' };
    if (latestValue <= 55) return { label: 'Neutral', color: '#eab308', text: 'text-yellow-600' };
    if (latestValue <= 75) return { label: 'Greed', color: '#16a34a', text: 'text-green-600' };
    return { label: 'Extreme Greed', color: '#2563eb', text: 'text-blue-600' };
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Sentiment</h3>
          <div className="flex items-baseline gap-3">
            <span className={`text-6xl font-black tracking-tighter ${sentiment.text}`}>
              {latestValue.toFixed(0)}
            </span>
            <span className={`text-xl font-bold uppercase tracking-tight ${sentiment.text} opacity-80`}>
              {sentiment.label}
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Historical Data
          </div>
          <p className="text-xs text-gray-400 uppercase">Daily Intervals</p>
        </div>
      </div>

      <div className="h-[450px] w-full" id="fear-greed-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM')}
              stroke="#9ca3af"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#9ca3af"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              ticks={[0, 25, 45, 55, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* @ts-ignore */}
            <ReferenceArea y1={0} y2={25} fill="#ef4444" fillOpacity={0.12} />
            {/* @ts-ignore */}
            <ReferenceArea y1={25} y2={45} fill="#f97316" fillOpacity={0.12} />
            {/* @ts-ignore */}
            <ReferenceArea y1={45} y2={55} fill="#facc15" fillOpacity={0.12} />
            {/* @ts-ignore */}
            <ReferenceArea y1={55} y2={75} fill="#22c55e" fillOpacity={0.12} />
            {/* @ts-ignore */}
            <ReferenceArea y1={75} y2={100} fill="#3b82f6" fillOpacity={0.12} />

            <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="5 5" />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#111827"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-2">
        <div className="flex flex-col border-t-2 border-red-500 pt-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Extreme Fear</span>
          <span className="text-xs font-semibold text-gray-700">0 - 25</span>
        </div>
        <div className="flex flex-col border-t-2 border-orange-500 pt-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Fear</span>
          <span className="text-xs font-semibold text-gray-700">25 - 45</span>
        </div>
        <div className="flex flex-col border-t-2 border-yellow-500 pt-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Neutral</span>
          <span className="text-xs font-semibold text-gray-700">45 - 55</span>
        </div>
        <div className="flex flex-col border-t-2 border-green-500 pt-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Greed</span>
          <span className="text-xs font-semibold text-gray-700">55 - 75</span>
        </div>
        <div className="flex flex-col border-t-2 border-blue-500 pt-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Extreme Greed</span>
          <span className="text-xs font-semibold text-gray-700">75 - 100</span>
        </div>
      </div>
    </div>
  );
};
