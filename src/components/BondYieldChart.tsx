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
  '#0f172a', // Slate 900
  '#2563eb', // Blue 600
  '#059669', // Emerald 600
  '#e11d48', // Rose 600
  '#d97706', // Amber 600
  '#0891b2', // Cyan 600
  '#7c3aed', // Violet 600
  '#475569'  // Slate 600
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
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">BOK Benchmark Rates</h3>
          <p className="text-2xl font-bold tracking-tight text-gray-900">Bond Market Yields</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Unit: % Per Annum</p>
        </div>
      </div>

      <div className="h-[450px] w-full" id="bond-yield-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={groupedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tickFormatter={(t) => format(parse(t, 'yyyyMMdd', new Date()), 'MMM yy')}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              minTickGap={60}
              dy={15}
              boundaryGap={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickCount={6}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ color: '#64748b', fontWeight: 700, fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase' }}
              labelFormatter={(t) => format(parse(t as string, 'yyyyMMdd', new Date()), 'MMMM dd, yyyy')}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            {bondNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                connectNulls
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

};
