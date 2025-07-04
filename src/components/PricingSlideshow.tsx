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
  const [historyRange, setHistoryRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

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
  
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      marquee.scrollLeft = (marquee.scrollLeft + speed * (elapsed / 1000)) % (marquee.scrollWidth / 2);
      start = timestamp;
      animationFrameRef.current = requestAnimationFrame(step);
    };
  
    animationFrameRef.current = requestAnimationFrame(step);
  
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [priceData]);
  

  // Button scroll handlers
  const pauseDuration = 3000; 

const scrollBy = (amount: number) => {
  const marquee = marqueeRef.current;
  if (marquee) {
    marquee.scrollBy({ left: amount, behavior: "smooth" });

    // Stop animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Restart after pause
    setTimeout(() => {
      let start: number | null = null;
      const speed = 40;
      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const elapsed = timestamp - start;
        marquee.scrollLeft = (marquee.scrollLeft + speed * (elapsed / 1000)) % (marquee.scrollWidth / 2);
        start = timestamp;
        animationFrameRef.current = requestAnimationFrame(step);
      };
      animationFrameRef.current = requestAnimationFrame(step);
    }, pauseDuration);
  }
};

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
function aggregateHistory(data: any[], range: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  if (!data || data.length === 0) return [];
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

  if (loading) return <Loader className="py-8" />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-semibold">Live Market Prices:</span>
            <div className="hidden sm:block w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-hidden relative mx-2 md:mx-6">
            <div
              ref={marqueeRef}
              className="relative w-full h-14 overflow-x-auto scrollbar-hide hide-scrollbar"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="flex items-center h-full">
                {priceData.concat(priceData).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-8 cursor-pointer hover:bg-slate-700/20 rounded-lg transition-colors" onClick={() => handleMaterialClick(item)}>
                    <div className="text-center">
                      <p className="font-semibold text-sm mb-1">{item.material}</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">{item.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.trend === 'up' 
                            ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                            : 'bg-red-500/20 text-red-200 border border-red-400/30'
                        }`}>
                          {item.trend === 'up'? '+' + item.change: '-' + item.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-12 flex items-center space-x-2 justify-center">
            <button
              onClick={() => scrollBy(-200)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(200)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Price History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogTitle>Price History for {historyMaterial}</DialogTitle>
          {/* Time Range Tabs */}
          <div className="mb-4 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm bg-slate-100">
              {['daily','weekly','monthly','yearly'].map(r => (
                <button
                  key={r}
                  className={`px-3 py-1 text-sm font-medium focus:outline-none transition-colors ${historyRange===r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700 hover:bg-blue-200'}`}
                  onClick={() => setHistoryRange(r as any)}
                  
                >
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
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
                <XAxis dataKey="changed_at" />
                <YAxis dataKey="new_price" />
                <Tooltip formatter={(value, name) => [value, 'Price']} />
                <Line type="monotone" dataKey="new_price"  stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingSlideshow;
