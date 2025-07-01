import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { getPricingData } from "@/lib/supabaseApi";
import type { PricingData } from "@/lib/types";
import Loader from "@/components/ui/loader";

const PricingSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [priceData, setPriceData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPricingData();
        setPriceData(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(priceData.length / 3));
    }, 4000);
    return () => clearInterval(timer);
  }, [priceData.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(priceData.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(priceData.length / 3)) % Math.ceil(priceData.length / 3));
  };

  const getVisibleItems = () => {
    const itemsPerSlide = 3;
    const start = currentSlide * itemsPerSlide;
    return priceData.slice(start, start + itemsPerSlide);
  };

  if (loading) return <Loader className="py-8" />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-semibold">Live Market Prices:</span>
            <div className="hidden sm:block w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex-1 mx-6 overflow-hidden">
            <div className="flex items-center justify-center space-x-8">
              {getVisibleItems().map((item, index) => (
                <div key={index} className="flex items-center space-x-4 animate-fade-in">
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

          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
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
