import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import SellUsedOrDeadStock from './SellUsedOrDeadStock';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, MapPin, Calendar, Settings, Zap } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

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
  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{item.machine_name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {item.location}
              </div>
              {item.year_of_make && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {item.year_of_make}
                </div>
              )}
            </div>
          </div>
          <Badge variant={item.electrical_panel_ok ? "default" : "secondary"}>
            {item.electrical_panel_ok ? "Panel OK" : "Panel Issues"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <MediaGallery images={item.image_urls} videos={item.video_urls} onMediaClick={onMediaClick} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Size:</span>
              <span>{item.size || 'Not specified'}</span>
            </div>
            {item.main_motor_hp && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Motor HP:</span>
                <span>{item.main_motor_hp}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {item.last_working_year && (
              <div>
                <span className="font-medium">Last Working Year:</span>
                <span className="ml-2">{item.last_working_year}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeadStockCard({ item, onMediaClick }: { item: any; onMediaClick: (url: string, type: 'image' | 'video') => void }) {
  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{item.stock_name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {item.location}
              </div>
              {item.year_of_purchase && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {item.year_of_purchase}
                </div>
              )}
            </div>
          </div>
          {item.year_of_purchase && (
            <Badge variant="secondary">Purchased {item.year_of_purchase}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <MediaGallery images={item.image_urls} videos={item.video_urls} onMediaClick={onMediaClick} />
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Cable/Material:</span>
              <span>{item.cable_name || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Qty:</span>
              <span>{item.qty || 'Not specified'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Size:</span>
              <span>{item.size || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
  }, []);

  // Handler to refresh listings after submit
  const handleFormSuccess = () => {
    fetchListings();
    setFormKey(k => k + 1); // reset form
    setShowForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <Button variant="ghost" className="mb-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold mb-6">Used Machines & Dead Stock Listings</h1>
        <div className="mb-8">
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              Add Used Machine or Dead Stock
            </Button>
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
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="used">Used Machines</TabsTrigger>
            <TabsTrigger value="dead">Dead Stock</TabsTrigger>
          </TabsList>
          <TabsContent value="used">
            {loading ? (
              <div>Loading...</div>
            ) : used.length === 0 ? (
              <div className="text-muted-foreground">No used machines listed yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </ProtectedRoute>
  );
};

export default UsedAndDeadStockListings; 