import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

export default function SellUsedMachine({ onSuccess }: Props) {
  const [machine, setMachine] = useState({
    machine_name: '', size: '', year_of_make: '', last_working_year: '',
    electrical_panel_ok: false, main_motor_hp: '', location: '',
    whatsapp_number: '', price: ''
  });
  // For multiple videos
  const [machineVideos, setMachineVideos] = useState<File[]>([]);
  const [machineImages, setMachineImages] = useState([null, null, null]);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleUsedMachineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload videos
      const videoUrls = await Promise.all(
        machineVideos.map((file: File) => apiClient.uploadFileToStorage(file, 'used-machines/videos'))
      );
      // Upload images
      const imageUrls = await Promise.all(
        machineImages.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'used-machines/images'))
      );
      await apiClient.createUsedMachine({
        ...machine,
        price: machine.price ? Number(machine.price) : null,
        year_of_make: machine.year_of_make ? Number(machine.year_of_make) : null,
        last_working_year: machine.last_working_year ? Number(machine.last_working_year) : null,
        video_urls: videoUrls,
        image_urls: imageUrls,
        whatsapp_number: machine.whatsapp_number,
      });
      toast({ title: 'Success', description: 'Used machine listed successfully!' });
      setMachine({ machine_name: '', size: '', year_of_make: '', last_working_year: '', electrical_panel_ok: false, main_motor_hp: '', location: '', whatsapp_number: '', price: '' });
      setMachineVideos([]);
      setMachineImages([null, null, null]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-2">
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleUsedMachineSubmit}>
        <Input placeholder="Machine Name" value={machine.machine_name} onChange={e => setMachine(m => ({ ...m, machine_name: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input placeholder="Size" value={machine.size} onChange={e => setMachine(m => ({ ...m, size: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input placeholder="Year of Make" type="number" value={machine.year_of_make} onChange={e => setMachine(m => ({ ...m, year_of_make: e.target.value }))} />
        <Input placeholder="Last Working Year" type="number" value={machine.last_working_year} onChange={e => setMachine(m => ({ ...m, last_working_year: e.target.value }))} />
        <div className="flex items-center gap-2">
          <span>Electrical Panel OK</span>
          <Switch checked={machine.electrical_panel_ok} onCheckedChange={v => setMachine(m => ({ ...m, electrical_panel_ok: v }))} />
        </div>
        <Input placeholder="Main Motor HP" value={machine.main_motor_hp} onChange={e => setMachine(m => ({ ...m, main_motor_hp: e.target.value }))} />
        <Input placeholder="Location" value={machine.location} onChange={e => setMachine(m => ({ ...m, location: e.target.value.replace(/[^a-zA-Z0-9,. ]/g, '').slice(0, 250) }))} maxLength={250} />
        <Input
          placeholder="WhatsApp Number"
          value={machine.whatsapp_number}
          onChange={e => setMachine(m => ({ ...m, whatsapp_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          maxLength={10}
        />
        <Input placeholder="Price (₹)" type="number" value={machine.price} onChange={e => setMachine(m => ({ ...m, price: e.target.value }))} />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Videos (optional, you can add multiple)
          </label>
          <CaptureOrUploadVideo
            onVideoSelect={(file) => {
              if (file) setMachineVideos((prev) => [...prev, file]);
            }}
          />
          {machineVideos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {machineVideos.map((video, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <video src={URL.createObjectURL(video)} controls className="h-24 rounded border object-contain" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                    onClick={() => setMachineVideos((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove video"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {machineImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {machineImages.map((file, idx) => file && (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 rounded border object-contain"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                  onClick={() => setMachineImages(prev => prev.map((f, i) => i === idx ? null : f))}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Used Machine'}</Button>
      </form>
    </div>
  );
} 