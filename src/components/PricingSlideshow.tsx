import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import apiClient from "@/lib/apiClient";
import type { PricingData } from "@/lib/types";
import Loader from "@/components/ui/loader";

const PricingSlideshow = () => {
  const [priceData, setPriceData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

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
                  <div key={index} className="flex items-center space-x-4 px-8">
                    <div className="text-center">
                      <p className="font-semibold text-sm mb-1">{item.material}</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">{item.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.trend === 'up' 
                            ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                            : 'bg-red-500/20 text-red-200 border border-red-400/30'
                        }`}>
                          {item.change}
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
    </div>
  );
};

export default PricingSlideshow;
