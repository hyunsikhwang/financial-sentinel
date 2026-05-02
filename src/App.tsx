import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  RefreshCcw, 
  AlertCircle,
  BarChart3,
  Globe
} from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { FearGreedData, FearGreedApiResponse, BondRow, EcosApiResponse } from './types';
import { FearGreedChart } from './components/FearGreedChart';
import { BondYieldChart } from './components/BondYieldChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'sentiment', label: 'Fear & Greed Index', icon: Activity },
  { id: 'bonds', label: 'Bond Yields', icon: TrendingUp },
];

const RANGES = [
  { label: '1Y', value: 1 },
  { label: '3Y', value: 3 },
  { label: '5Y', value: 5 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('sentiment');
  const [rangeYears, setRangeYears] = useState(1);
  const [fearGreedData, setFearGreedData] = useState<FearGreedData[]>([]);
  const [bondData, setBondData] = useState<BondRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFearGreedData = async () => {
    try {
      const { data } = await axios.get<FearGreedApiResponse>('/api/fear-and-greed');
      setFearGreedData(data.fear_and_greed_historical.data);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to load sentiment data');
    }
  };

  const fetchBondData = async () => {
    // Current month start
    const endDate = format(new Date(), 'yyyyMMdd');
    const startDate = format(subMonths(new Date(), 12 * rangeYears), 'yyyyMMdd');

    const bonds = [
      { cd: '722Y001', cd1: '0101000' }, // 국고채 (1년)
      { cd: '817Y002', cd1: '010190000' }, // 국고채 (3년)
      { cd: '817Y002', cd1: '010200000' }, // 국고채 (5년)
      { cd: '817Y002', cd1: '010210000' }, // 국고채 (10년)
    ];

    try {
      const allRows: BondRow[] = [];
      for (const b of bonds) {
        const { data } = await axios.get<EcosApiResponse>('/api/bond-yields', {
          params: {
            bondcd: b.cd,
            bondcd1: b.cd1,
            start_date: startDate,
            end_date: endDate
          }
        });
        if (data.StatisticSearch?.row) {
          allRows.push(...data.StatisticSearch.row);
        }
      }
      setBondData(allRows);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to load bond yield data');
    }
  };

  const loadData = useCallback(async () => {
    // Only show global loading spinner if we don't have data yet or if it's a new range
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'sentiment') {
        await fetchFearGreedData();
      } else {
        await fetchBondData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, rangeYears]);

  useEffect(() => {
    loadData();
  }, [activeTab, rangeYears]); // Fetch when tab or range changes

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Sidebar/Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Financial Sentinel</h1>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-white text-black shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'bonds' && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setRangeYears(range.value)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                    rangeYears === range.value 
                      ? "bg-white text-black shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            Live Market Intelligence
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {activeTab === 'sentiment' ? 'Market Sentiment' : 'Economic Indicators'}
          </h2>
          <p className="text-gray-500 mt-2 max-w-2xl leading-relaxed">
            {activeTab === 'sentiment' 
              ? 'CNN’s Fear & Greed Index tracks seven different indicators to determine how much fear or greed is driving the S&P 500.' 
              : 'Tracking South Korea’s benchmark bond yields provides insights into inflation expectations and domestic monetary policy direction.'}
          </p>
        </header>

        <div className="relative group">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-red-100 p-12 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Could not load data</h3>
                <p className="text-gray-500 text-sm max-w-xs">{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-6 px-6 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  Retry Connection
                </button>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 p-24 rounded-2xl flex flex-col items-center justify-center shadow-sm"
              >
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Syncing Intelligence...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500"
              >
                {activeTab === 'sentiment' ? (
                  <FearGreedChart data={fearGreedData} />
                ) : (
                  <BondYieldChart data={bondData} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-20 border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Real-time Connected</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Update Policy</span>
              <span className="text-xs font-medium">Daily Synchronized</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">© 2026 Financial Sentinel. Educational data visualization.</p>
        </footer>
      </main>
    </div>
  );
}
