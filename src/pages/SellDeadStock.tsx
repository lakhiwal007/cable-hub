import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const VideoImageInputs = ({ label, files, setFiles, max = 3, accept }: any) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    {[...Array(max)].map((_, i) => (
      <Input
        key={i}
        type="file"
        accept={accept}
        onChange={e => {
          const newFiles = [...files];
          newFiles[i] = e.target.files?.[0] || null;
          setFiles(newFiles);
        }}
        className="mb-2"
      />
    ))}
  </div>
);

interface Props {
  onSuccess?: () => void;
}

export default function SellDeadStock({ onSuccess }: Props) {
  const [stock, setStock] = useState({
    stock_name: '', cable_name: '', qty: '', size: '', year_of_purchase: '', location: '',
    whatsapp_number: ''
  });
  const [stockVideos, setStockVideos] = useState([null, null, null]);
  const [stockImages, setStockImages] = useState([null, null, null]);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDeadStockSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload videos
      const videoUrls = await Promise.all(
        stockVideos.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'dead-stock/videos'))
      );
      // Upload images
      const imageUrls = await Promise.all(
        stockImages.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'dead-stock/images'))
      );
      await apiClient.createDeadStock({
        ...stock,
        year_of_purchase: stock.year_of_purchase ? Number(stock.year_of_purchase) : null,
        video_urls: videoUrls,
        image_urls: imageUrls,
        whatsapp_number: stock.whatsapp_number,
      });
      toast({ title: 'Success', description: 'Dead stock listed successfully!' });
      setStock({ stock_name: '', cable_name: '', qty: '', size: '', year_of_purchase: '', location: '', whatsapp_number: '' });
      setStockVideos([null, null, null]);
      setStockImages([null, null, null]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-2">
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleDeadStockSubmit}>
        <Input placeholder="Stock Name" value={stock.stock_name} onChange={e => setStock(s => ({ ...s, stock_name: e.target.value }))} />
        <Input placeholder="Cable/Wire/Raw Material Name" value={stock.cable_name} onChange={e => setStock(s => ({ ...s, cable_name: e.target.value }))} />
        <Input placeholder="Qty" value={stock.qty} onChange={e => setStock(s => ({ ...s, qty: e.target.value }))} />
        <Input placeholder="Size" value={stock.size} onChange={e => setStock(s => ({ ...s, size: e.target.value }))} />
        <Input placeholder="Year of Purchase" type="number" value={stock.year_of_purchase} onChange={e => setStock(s => ({ ...s, year_of_purchase: e.target.value }))} />
        <Input placeholder="Location" value={stock.location} onChange={e => setStock(s => ({ ...s, location: e.target.value }))} />
        <Input placeholder="WhatsApp Number" value={stock.whatsapp_number} onChange={e => setStock(s => ({ ...s, whatsapp_number: e.target.value }))} />
        <VideoImageInputs label="Videos" files={stockVideos} setFiles={setStockVideos} accept="video/*" />
        <VideoImageInputs label="Images" files={stockImages} setFiles={setStockImages} accept="image/*" />
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Dead Stock'}</Button>
      </form>
    </div>
  );
} 