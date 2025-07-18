import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import CaptureOrUploadImage from "@/components/CaptureOrUploadImage";
import CaptureOrUploadVideo from "@/components/CaptureOrUploadVideo";
import { X } from 'lucide-react';

const VideoImageInputs = ({ label, files, setFiles, max = 3, accept }: any) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <CaptureOrUploadImage
      label={label}
      multiple={max > 1}
      onImageSelect={file => setFiles((prev: any[]) => {
        const newFiles = [...prev];
        // Find first empty slot
        const idx = newFiles.findIndex(f => !f);
        if (idx !== -1) newFiles[idx] = file;
        else newFiles.push(file);
        return newFiles.slice(0, max);
      })}
      accept={accept}
    />
  </div>
);

interface Props {
  onSuccess?: () => void;
}

export default function SellDeadStock({ onSuccess }: Props) {
  const [stock, setStock] = useState({
    stock_name: '', cable_name: '', qty: '', size: '', year_of_purchase: '', location: '',
    whatsapp_number: '', budget_min: '', budget_max: ''
  });
  // For multiple videos
  const [stockVideos, setStockVideos] = useState<File[]>([]);
  const [stockImages, setStockImages] = useState([null, null, null]);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDeadStockSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload videos
      const videoUrls = await Promise.all(
        stockVideos.map((file: File) => apiClient.uploadFileToStorage(file, 'dead-stock/videos'))
      );
      // Upload images
      const imageUrls = await Promise.all(
        stockImages.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'dead-stock/images'))
      );
      await apiClient.createDeadStock({
        ...stock,
        budget_min: stock.budget_min ? Number(stock.budget_min) : null,
        budget_max: stock.budget_max ? Number(stock.budget_max) : null,
        year_of_purchase: stock.year_of_purchase ? Number(stock.year_of_purchase) : null,
        video_urls: videoUrls,
        image_urls: imageUrls,
        whatsapp_number: stock.whatsapp_number,
      });
      toast({ title: 'Success', description: 'Dead stock listed successfully!' });
      setStock({ stock_name: '', cable_name: '', qty: '', size: '', year_of_purchase: '', location: '', whatsapp_number: '', budget_min: '', budget_max: '' });
      setStockVideos([]);
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
        <Input placeholder="Stock Name" value={stock.stock_name} onChange={e => setStock(s => ({ ...s, stock_name: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input placeholder="Cable/Wire/Raw Material Name" value={stock.cable_name} onChange={e => setStock(s => ({ ...s, cable_name: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input placeholder="Qty" value={stock.qty} onChange={e => setStock(s => ({ ...s, qty: e.target.value }))} />
        <Input placeholder="Size" value={stock.size} onChange={e => setStock(s => ({ ...s, size: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input placeholder="Year of Purchase" type="number" value={stock.year_of_purchase} onChange={e => setStock(s => ({ ...s, year_of_purchase: e.target.value }))} />
        <Input placeholder="Location" value={stock.location} onChange={e => setStock(s => ({ ...s, location: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input
          placeholder="WhatsApp Number"
          value={stock.whatsapp_number}
          onChange={e => setStock(s => ({ ...s, whatsapp_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          maxLength={10}
        />
        <Input placeholder="Budget Min (₹)" type="number" value={stock.budget_min} onChange={e => setStock(s => ({ ...s, budget_min: e.target.value }))} />
        <Input placeholder="Budget Max (₹)" type="number" value={stock.budget_max} onChange={e => setStock(s => ({ ...s, budget_max: e.target.value }))} />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Videos (optional, you can add multiple)
          </label>
          <CaptureOrUploadVideo
            onVideoSelect={(file) => {
              if (file) setStockVideos((prev) => [...prev, file]);
            }}
          />

        </div>
        <VideoImageInputs label="Images" files={stockImages} setFiles={setStockImages} accept="image/*" />
        {stockImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {stockImages.map((file, idx) => file && (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 rounded border object-contain"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                  onClick={() => setStockImages(prev => prev.map((f, i) => i === idx ? null : f))}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        )}
        {stockVideos.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {stockVideos.map((file, idx) => file && (
              <div key={idx} className="relative w-fit">
                <video src={URL.createObjectURL(file)} controls className="h-24 rounded border object-contain" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                  onClick={() => setStockVideos(prev => prev.map((f, i) => i === idx ? null : f))}
                  aria-label="Remove video"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Dead Stock'}</Button>
      </form>
    </div>
  );
} 