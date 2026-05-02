import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parse } from 'date-fns';
import { BondRow } from '../types';

interface Props {
  data: BondRow[];
}

const COLORS = [
  '#000000', '#2563eb', '#dc2626', '#16a34a', 
  '#9333ea', '#ea580c', '#0891b2', '#4f46e5'
];

export const BondYieldChart: React.FC<Props> = ({ data }) => {
  const { groupedData, bondNames } = useMemo(() => {
    if (!data || data.length === 0) return { groupedData: [], bondNames: [] };
    
    const names = Array.from(new Set(data.map((d) => d.ITEM_NAME1)));
    
    // Group by TIME
    const timeMap: Record<string, any> = {};
    data.forEach((row) => {
      if (!timeMap[row.TIME]) {
        timeMap[row.TIME] = { time: row.TIME };
      }
      timeMap[row.TIME][row.ITEM_NAME1] = parseFloat(row.DATA_VALUE);
    });

    const sortedData = Object.values(timeMap).sort((a, b) => a.time.localeCompare(b.time));
    
    return { 
      groupedData: sortedData, 
      bondNames: names 
    };
  }, [data]);

  if (groupedData.length === 0) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No bond yield data available. Check API configuration.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bond Yields</h3>
        <p className="text-xs text-gray-400 mt-1 uppercase">Source: Bank of Korea (ECOS)</p>
      </div>

      <div className="h-[450px] w-full" id="bond-yield-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={groupedData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tickFormatter={(t) => format(parse(t, 'yyyyMMdd', new Date()), 'MMM yyyy')}
              stroke="#9ca3af"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              minTickGap={60}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              label={{ value: '%', position: 'insideTopLeft', offset: -20, fill: '#9ca3af', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(t) => format(parse(t as string, 'yyyyMMdd', new Date()), 'MMMM dd, yyyy')}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }}
            />
            {bondNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
