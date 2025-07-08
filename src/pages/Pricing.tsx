import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, TrendingUp, TrendingDown, Minus, Filter, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

interface PricingData {
  id: string;
  material: string;
  price: string;
  change: string;
  trend: string;
  created_at: string;
}

interface MaterialPriceHistory {
  old_price: string;
  new_price: string;
  changed_at: string;
}

const Pricing = () => {
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [filteredData, setFilteredData] = useState<PricingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedTrend, setSelectedTrend] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<MaterialPriceHistory[]>([]);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('30d');
  const [historyDay, setHistoryDay] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();
  useEffect(() => {
    fetchPricingData();
  }, []);

  useEffect(() => {
    filterData();
  }, [pricingData, searchTerm, selectedMaterial, selectedTrend]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPricingData();
      setPricingData(data);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async (pricingId: string) => {
    try {
      const history = await apiClient.getMaterialPriceHistory(pricingId);
      setPriceHistory(history);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    }
  };

  const filterData = () => {
    let filtered = pricingData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.material.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by material
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(item => item.material === selectedMaterial);
    }

    // Filter by trend
    if (selectedTrend !== 'all') {
      filtered = filtered.filter(item => item.trend === selectedTrend);
    }

    setFilteredData(filtered);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getChangeColor = (change: string) => {
    const changeValue = parseFloat(change.replace(/[^\d.-]/g, ''));
    if (changeValue > 0) return 'text-green-600';
    if (changeValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPrice = (price: string) => {
    return `₹${price}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMaterialClick = (pricingId: string) => {
    setSelectedPricingId(pricingId);
    fetchPriceHistory(pricingId);
  };

  const getUniqueMaterials = () => {
    return [...new Set(pricingData.map(item => item.material))];
  };

  const prepareChartData = () => {
    if (!priceHistory.length) return [];
    if (timeRange === '1d') {
      // Filter for the selected day and sort by minute
      return priceHistory
        .filter(item => item.changed_at && item.changed_at.startsWith(historyDay))
        .map(item => ({
          ...item,
          time: new Date(item.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          new_price: parseFloat(item.new_price)
        }))
        .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
    }
    // Group by date and calculate average price for each date
    const groupedData = priceHistory.reduce((acc: any, item) => {
      const date = new Date(item.changed_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          prices: [],
          avgPrice: 0
        };
      }
      acc[date].prices.push(parseFloat(item.new_price));
      return acc;
    }, {});
    // Calculate average price for each date
    Object.keys(groupedData).forEach(date => {
      const prices = groupedData[date].prices;
      groupedData[date].avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    });
    return Object.values(groupedData).sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const exportData = () => {
    const csvContent = [
      ['Material', 'Price', 'Change', 'Trend', 'Last Updated'],
      ...filteredData.map(item => [
        item.material,
        item.price,
        item.change,
        item.trend,
        formatDate(item.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market-pricing-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Market Pricing" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Material Filter */}
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="All Materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {getUniqueMaterials().map(material => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Trend Filter */}
              <Select value={selectedTrend} onValueChange={setSelectedTrend}>
                <SelectTrigger>
                  <SelectValue placeholder="All Trends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trends</SelectItem>
                  <SelectItem value="up">Trending Up</SelectItem>
                  <SelectItem value="down">Trending Down</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing Cards */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Market Prices</span>
                  <Button
                    onClick={fetchPricingData}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredData.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${selectedPricingId === item.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                      onClick={() => handleMaterialClick(item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{item.material}</h3>
                          {getTrendIcon(item.trend)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Current Price:</span>
                            <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Change:</span>
                            <span className={`font-semibold ${getChangeColor(item.change)}`}>
                              {item.change}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Trend:</span>
                            <Badge className={getTrendColor(item.trend)}>
                              {item.trend}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {formatDate(item.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pricing data found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price History Chart */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPricingId && priceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {/* Time Range Selector */}
                    <div className="flex gap-2 flex-wrap">
                      {(['1d', '7d', '30d', '90d', '1y'] as const).map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTimeRange(range)}
                        >
                          {range}
                        </Button>
                      ))}
                      {timeRange === '1d' && (
                        <input
                          type="date"
                          value={historyDay}
                          onChange={e => setHistoryDay(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          max={new Date().toISOString().slice(0, 10)}
                        />
                      )}
                    </div>

                    {/* Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey={timeRange === '1d' ? 'time' : 'date'}
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip
                            formatter={(value: any) => [`₹${value}`, 'Price']}
                            labelFormatter={(label) => timeRange === '1d' ? `Time: ${label}` : `Date: ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey={timeRange === '1d' ? 'new_price' : 'avgPrice'}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Highest</div>
                        <div className="text-green-600">
                          ₹{Math.max(...priceHistory.map(p => parseFloat(p.new_price))).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Lowest</div>
                        <div className="text-red-600">
                          ₹{Math.min(...priceHistory.map(p => parseFloat(p.new_price))).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a material to view price history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {pricingData.filter(item => item.trend === 'up').length}
                </div>
                <div className="text-sm text-gray-600">Trending Up</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {pricingData.filter(item => item.trend === 'down').length}
                </div>
                <div className="text-sm text-gray-600">Trending Down</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {pricingData.filter(item => item.trend === 'stable').length}
                </div>
                <div className="text-sm text-gray-600">Stable</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {pricingData.length}
                </div>
                <div className="text-sm text-gray-600">Total Materials</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Pricing; 