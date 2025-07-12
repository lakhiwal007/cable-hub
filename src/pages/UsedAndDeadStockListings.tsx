import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import SellUsedMachine from './SellUsedMachine';
import SellDeadStock from './SellDeadStock';
import { useNavigate } from 'react-router-dom';
import { Settings, Zap, Eye, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Loader from '@/components/ui/loader';
import UsedMachineCard from '@/components/marketplace/UsedMachineCard';
import DeadStockCard from '@/components/marketplace/DeadStockCard';

function MediaGallery({ images = [], videos = [], onMediaClick }: { images?: string[]; videos?: string[]; onMediaClick?: (url: string, type: 'image' | 'video') => void }) {
  if (!images?.length && !videos?.length) {
    return (
      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No media available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
      {images?.slice(0, 3).map((url, i) => (
        <img
          key={i}
          src={url}
          alt="Image"
          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:brightness-90"
          onClick={() => onMediaClick && onMediaClick(url, 'image')}
        />
      ))}
      {videos?.slice(0, 3).map((url, i) => (
        <video
          key={i}
          src={url}
          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:brightness-90"
          onClick={() => onMediaClick && onMediaClick(url, 'video')}
        />
      ))}
    </div>
  );
}

const UsedAndDeadStockListings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [browseTab, setBrowseTab] = useState<'used' | 'dead'>('used');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [used, setUsed] = useState<any[]>([]);
  const [dead, setDead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();
  const [mediaDialog, setMediaDialog] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "machines", label: "Machines" },
    { value: "cables", label: "Cables" },
    { value: "wires", label: "Wires" },
    { value: "raw_materials", label: "Raw Materials" },
    { value: "equipment", label: "Equipment" }
  ];

  const fetchListings = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiClient.getUsedMachines().catch(() => []),
      apiClient.getDeadStock().catch(() => []),
    ]).then(([usedData, deadData]) => {
      setUsed(usedData || []);
      setDead(deadData || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Failed to fetch listings');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchListings();
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  const handleFormSuccess = () => {
    fetchListings();
    setFormKey(k => k + 1);
  };

  // Filter listings based on search and category
  const filteredUsedListings = used.filter((item) => {
    const matchesSearch = item.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.size?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDeadListings = dead.filter((item) => {
    const matchesSearch = item.stock_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cable_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header title="Used Machines & Dead Stock" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Used Machines & Dead Stock</h2>
                <p className="text-sm sm:text-base text-gray-600">Buy and sell used machines and surplus stock with ease</p>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader className="py-12" />
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <p>Error: {error}</p>
              <button onClick={fetchListings} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Try Again
              </button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
                <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
                <TabsTrigger value="post-used" className="text-xs sm:text-sm">Sell Used Machine</TabsTrigger>
                <TabsTrigger value="post-dead" className="text-xs sm:text-sm">Sell Dead Stock</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4 sm:space-y-6">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search machines, stock, or locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 text-sm sm:text-base">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-tabs for Used/Dead */}
                <Tabs value={browseTab} onValueChange={v => setBrowseTab(v as 'used' | 'dead')} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4 gap-1 sm:gap-2">
                    <TabsTrigger value="used" className="text-xs sm:text-sm">Used Machines</TabsTrigger>
                    <TabsTrigger value="dead" className="text-xs sm:text-sm">Dead Stock</TabsTrigger>
                  </TabsList>
                  <TabsContent value="used">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Used Machines</h3>
                      {filteredUsedListings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          No used machines found. Try adjusting your search or filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredUsedListings.map((item) => (
                            <UsedMachineCard key={item.id} item={item} onMediaClick={(url, type) => setMediaDialog({ url, type })} />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="dead">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Dead Stock</h3>
                      {filteredDeadListings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          No dead stock found. Try adjusting your search or filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredDeadListings.map((item) => (
                            <DeadStockCard key={item.id} item={item} onMediaClick={(url, type) => setMediaDialog({ url, type })} />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="post-used" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      Sell Used Machine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SellUsedMachine key={formKey} onSuccess={handleFormSuccess} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="post-dead" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600" />
                      Sell Dead Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SellDeadStock key={formKey} onSuccess={handleFormSuccess} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <Dialog open={!!mediaDialog} onOpenChange={open => !open && setMediaDialog(null)}>
            <DialogContent className="max-w-2xl">
              {mediaDialog?.type === 'image' ? (
                <img src={mediaDialog.url} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain rounded" />
              ) : mediaDialog?.type === 'video' ? (
                <video src={mediaDialog.url} controls autoPlay className="w-full h-auto max-h-[70vh] object-contain rounded" />
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default UsedAndDeadStockListings; 