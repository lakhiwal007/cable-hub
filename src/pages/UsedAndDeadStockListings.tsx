import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import SellUsedOrDeadStock from './SellUsedOrDeadStock';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, MapPin, Calendar, Settings, Zap } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import Header from '@/components/Header';

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

function UsedMachineCard({ item, onMediaClick }: { item: any; onMediaClick: (url: string, type: 'image' | 'video') => void }) {
  const mainImage = item.image_urls?.[0] || '/placeholder.svg';
  const thumbnails = item.image_urls?.slice(1, 4) || [];
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
        <img
          src={mainImage}
          alt={item.machine_name}
          className="object-contain w-full h-full max-h-56 transition-transform duration-200 hover:scale-105 cursor-pointer"
          onClick={() => onMediaClick(mainImage, 'image')}
        />
        {item.electrical_panel_ok !== undefined && (
          <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded font-semibold ${item.electrical_panel_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.electrical_panel_ok ? 'Panel OK' : 'Panel Issues'}</span>
        )}
      </div>
      {thumbnails.length > 0 && (
        <div className="flex gap-2 px-4 py-2">
          {thumbnails.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt="Thumb"
              className="w-12 h-12 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-blue-400"
              onClick={() => onMediaClick(url, 'image')}
            />
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-col px-3 sm:px-4 py-2 sm:py-3">
        <h2 className="font-bold text-base sm:text-lg mb-1 truncate" title={item.machine_name}>{item.machine_name}</h2>
        <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</span>
          {item.year_of_make && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{item.year_of_make}</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm mb-2">
          <div><span className="font-medium">Size:</span> {item.size || 'N/A'}</div>
          <div><span className="font-medium">Motor HP:</span> {item.main_motor_hp || 'N/A'}</div>
          <div><span className="font-medium">Last Working Year:</span> {item.last_working_year || 'N/A'}</div>
        </div>
        <Button className="mt-auto w-full" variant="outline" onClick={() => onMediaClick(mainImage, 'image')}>View Details</Button>
      </div>
    </div>
  );
}

function DeadStockCard({ item, onMediaClick }: { item: any; onMediaClick: (url: string, type: 'image' | 'video') => void }) {
  const mainImage = item.image_urls?.[0] || '/placeholder.svg';
  const thumbnails = item.image_urls?.slice(1, 4) || [];
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
        <img
          src={mainImage}
          alt={item.stock_name}
          className="object-contain w-full h-full max-h-56 transition-transform duration-200 hover:scale-105 cursor-pointer"
          onClick={() => onMediaClick(mainImage, 'image')}
        />
        {item.year_of_purchase && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded font-semibold bg-yellow-100 text-yellow-700">Purchased {item.year_of_purchase}</span>
        )}
      </div>
      {thumbnails.length > 0 && (
        <div className="flex gap-2 px-4 py-2">
          {thumbnails.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt="Thumb"
              className="w-12 h-12 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-blue-400"
              onClick={() => onMediaClick(url, 'image')}
            />
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-col px-3 sm:px-4 py-2 sm:py-3">
        <h2 className="font-bold text-base sm:text-lg mb-1 truncate" title={item.stock_name}>{item.stock_name}</h2>
        <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm mb-2">
          <div><span className="font-medium">Cable/Material:</span> {item.cable_name || 'N/A'}</div>
          <div><span className="font-medium">Qty:</span> {item.qty || 'N/A'}</div>
          <div><span className="font-medium">Size:</span> {item.size || 'N/A'}</div>
        </div>
        <Button className="mt-auto w-full" variant="outline" onClick={() => onMediaClick(mainImage, 'image')}>View Details</Button>
      </div>
    </div>
  );
}

const UsedAndDeadStockListings: React.FC = () => {
  const [tab, setTab] = useState('used');
  const [used, setUsed] = useState<any[]>([]);
  const [dead, setDead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formKey, setFormKey] = useState(0); // to reset form after submit
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [mediaDialog, setMediaDialog] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    Promise.all([
      apiClient.getUsedMachines().catch(() => []),
      apiClient.getDeadStock().catch(() => []),
    ]).then(([used, dead]) => {
      setUsed(used || []);
      setDead(dead || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchListings();
    // Check authentication status
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  // Handler to refresh listings after submit
  const handleFormSuccess = () => {
    fetchListings();
    setFormKey(k => k + 1); // reset form
    setShowForm(false);
  };

  return (
    <>
      <Header title="Used Machines & Dead Stock Listings" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="mb-4 sm:mb-8">
          {!showForm && (
            isAuthenticated ? (
              <Button onClick={() => setShowForm(true)}>
                Add Used Machine or Dead Stock
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-gray-500">You must be logged in to add used machines or dead stock.</div>
                <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
                  Login to Add Listing
                </Button>
              </div>
            )
          )}
          {showForm && (
            <div className="relative border rounded-lg">
              <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </Button>
              <SellUsedOrDeadStock key={formKey} onSuccess={handleFormSuccess} />
            </div>
          )}
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full flex-wrap">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="used" className="flex items-center gap-2 py-3">
              <span className="text-[12px] sm:text-base">Used Machines</span>
            </TabsTrigger>
            <TabsTrigger value="dead" className="flex items-center gap-2 py-3">
              <span className="text-[12px] sm:text-base">Dead Stock</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="used">
            {loading ? (
              <div>Loading...</div>
            ) : used.length === 0 ? (
              <div className="text-muted-foreground">No used machines listed yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {used.map(item => (
                  <UsedMachineCard key={item.id} item={item} onMediaClick={(url, type) => setMediaDialog({ url, type })} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="dead">
            {loading ? (
              <div>Loading...</div>
            ) : dead.length === 0 ? (
              <div className="text-muted-foreground">No dead stock listed yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {dead.map(item => (
                  <DeadStockCard key={item.id} item={item} onMediaClick={(url, type) => setMediaDialog({ url, type })} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
    </>
  );
};

export default UsedAndDeadStockListings; 