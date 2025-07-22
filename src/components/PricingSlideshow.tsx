import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import apiClient from "@/lib/apiClient";
import type { PricingData } from "@/lib/types";
import Loader from "@/components/ui/loader";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const PricingSlideshow = () => {
  const [priceData, setPriceData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // New state for modal and price history
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyMaterial, setHistoryMaterial] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // New state for time range
  const [historyRange, setHistoryRange] = useState<'1d' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('1d');
  const [historyDay, setHistoryDay] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // New state for pausing animation
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getPricingData();
        setPriceData(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || priceData.length === 0) return;
  
    let start: number | null = null;
    const speed = 40; // px per second
    const itemWidth = marquee.scrollWidth / 2; // Width of one complete set of items
  
    const step = (timestamp: number) => {
      if (isPaused) return;
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      
      // Calculate new scroll position
      const newScrollLeft = marquee.scrollLeft + speed * (elapsed / 1000);
      
      // If we've scrolled past the first set of items, reset to the beginning
      if (newScrollLeft >= itemWidth) {
        marquee.scrollLeft = newScrollLeft - itemWidth;
      } else {
        marquee.scrollLeft = newScrollLeft;
      }
      
      start = timestamp;
      animationFrameRef.current = requestAnimationFrame(step);
    };
  
    animationFrameRef.current = requestAnimationFrame(step);
  
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [priceData, isPaused]);
  

const handleMaterialClick = async (item: PricingData) => {
  setShowHistory(true);
  setHistoryMaterial(item.material);
  setHistoryLoading(true);
  setHistoryError(null);
  try {
    const data = await apiClient.getMaterialPriceHistory(item.id);
    setHistoryData(data || []);
  } catch (err: any) {
    setHistoryError(err.message || 'Failed to fetch price history');
  } finally {
    setHistoryLoading(false);
  }
};

// Helper: Aggregate data by range
function aggregateHistory(data: any[], range: '1d' | 'daily' | 'weekly' | 'monthly' | 'yearly') {
  if (!data || data.length === 0) return [];
  if (range === '1d') {
    // Filter for the selected day and sort by time
    return data
      .filter(d => d.changed_at && d.changed_at.startsWith(historyDay))
      .map(d => ({ ...d, new_price: Number(d.new_price) }))
      .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
  }
  const parseDate = (d: string) => new Date(d);
  const formatKey = (date: Date) => {
    if (range === 'daily') return date.toISOString().split('T')[0];
    if (range === 'weekly') {
      // Get ISO week string: YYYY-Www
      const d = new Date(date.getTime());
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday as first day
      const year = d.getFullYear();
      const week = Math.ceil((((d.getTime() - new Date(year,0,1).getTime()) / 86400000) + new Date(year,0,1).getDay()+1)/7);
      return `${year}-W${week.toString().padStart(2,'0')}`;
    }
    if (range === 'monthly') return date.getFullYear() + '-' + (date.getMonth()+1).toString().padStart(2,'0');
    if (range === 'yearly') return date.getFullYear().toString();
    return '';
  };
  const grouped: Record<string, any> = {};
  data.forEach(d => {
    const date = parseDate(d.changed_at);
    const key = formatKey(date);
    if (!grouped[key] || new Date(d.changed_at) > new Date(grouped[key].changed_at)) {
      grouped[key] = { ...d, changed_at: key, new_price: Number(d.new_price) };
    }
  });
  // Sort by key (date ascending)
  return Object.values(grouped).sort((a, b) => a.changed_at.localeCompare(b.changed_at));
}

const formatXAxis = (tick: string) => {
  if (historyRange === '1d') {
    const date = new Date(tick);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return tick;
};

  if (loading) return <Loader className="py-8" />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-blue-800/90 text-white sticky top-0 z-50 shadow-lg backdrop-blur-md">
      <div className="w-full">
        <div className="flex items-center justify-between flex-wrap">
          
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={marqueeRef}
              className="relative w-full overflow-x-auto scrollbar-hide hide-scrollbar"
              style={{ whiteSpace: "nowrap" }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="flex items-center h-full">
                {/* Create multiple copies for seamless infinite scroll */}
                {Array.from({ length: 4 }, (_, copyIndex) => 
                  priceData.map((item, index) => (
                    <div 
                      key={`${copyIndex}-${index}`} 
                      className="flex items-center px-4 py-1 cursor-pointer hover:bg-white/10 rounded-lg transition-colors" 
                      onClick={() => handleMaterialClick(item)}
                    >
                    <div className="text-center">
                      <p className="font-semibold text-xs">{item.material}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold">{item.price}</span>
                        <span className={`text-xs px-2 rounded-full font-medium ${
                          item.trend === 'up' 
                            ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                            : 'bg-red-500/20 text-red-200 border border-red-400/30'
                        }`}>
                          {item.trend === 'up'? '+' + item.change: '-' + item.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      {/* Price History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogTitle>Price History for {historyMaterial}</DialogTitle>
          {/* Time Range Tabs */}
          <div className="mb-4 flex flex-col items-center">
            <div className="inline-flex rounded-md shadow-sm bg-slate-100 mb-2">
              {['1d','daily','weekly','monthly','yearly'].map(r => (
                <button
                  key={r}
                  className={`px-3 py-1 text-sm font-medium focus:outline-none transition-colors ${historyRange===r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700 hover:bg-blue-200'}`}
                  onClick={() => setHistoryRange(r as any)}
                >
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
            {/* Show date picker only for 1d view */}
            {historyRange === '1d' && (
              <input
                type="date"
                value={historyDay}
                onChange={e => setHistoryDay(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                max={new Date().toISOString().slice(0, 10)}
              />
            )}
          </div>
          {historyLoading ? (
            <Loader className="py-8" />
          ) : historyError ? (
            <div className="text-red-500">{historyError}</div>
          ) : historyData.length === 0 ? (
            <div>No price history available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aggregateHistory(historyData, historyRange)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="changed_at" tickFormatter={formatXAxis} />
                <YAxis dataKey="new_price" />
                <Tooltip formatter={(value, name) => [value, 'Price']} />
                <Line type="monotone" dataKey="new_price"  stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingSlideshow;
