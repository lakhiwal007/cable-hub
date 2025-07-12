import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

export default function SellUsedMachine({ onSuccess }: Props) {
  const [machine, setMachine] = useState({
    machine_name: '', size: '', year_of_make: '', last_working_year: '',
    electrical_panel_ok: false, main_motor_hp: '', location: '',
    whatsapp_number: ''
  });
  const [machineVideos, setMachineVideos] = useState([null, null, null]);
  const [machineImages, setMachineImages] = useState([null, null, null]);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleUsedMachineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload videos
      const videoUrls = await Promise.all(
        machineVideos.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'used-machines/videos'))
      );
      // Upload images
      const imageUrls = await Promise.all(
        machineImages.filter(Boolean).map((file: File) => apiClient.uploadFileToStorage(file, 'used-machines/images'))
      );
      await apiClient.createUsedMachine({
        ...machine,
        year_of_make: machine.year_of_make ? Number(machine.year_of_make) : null,
        last_working_year: machine.last_working_year ? Number(machine.last_working_year) : null,
        video_urls: videoUrls,
        image_urls: imageUrls,
        whatsapp_number: machine.whatsapp_number,
      });
      toast({ title: 'Success', description: 'Used machine listed successfully!' });
      setMachine({ machine_name: '', size: '', year_of_make: '', last_working_year: '', electrical_panel_ok: false, main_motor_hp: '', location: '', whatsapp_number: '' });
      setMachineVideos([null, null, null]);
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
        <Input placeholder="Machine Name" value={machine.machine_name} onChange={e => setMachine(m => ({ ...m, machine_name: e.target.value }))} />
        <Input placeholder="Size" value={machine.size} onChange={e => setMachine(m => ({ ...m, size: e.target.value }))} />
        <Input placeholder="Year of Make" type="number" value={machine.year_of_make} onChange={e => setMachine(m => ({ ...m, year_of_make: e.target.value }))} />
        <Input placeholder="Last Working Year" type="number" value={machine.last_working_year} onChange={e => setMachine(m => ({ ...m, last_working_year: e.target.value }))} />
        <div className="flex items-center gap-2">
          <span>Electrical Panel OK</span>
          <Switch checked={machine.electrical_panel_ok} onCheckedChange={v => setMachine(m => ({ ...m, electrical_panel_ok: v }))} />
        </div>
        <Input placeholder="Main Motor HP" value={machine.main_motor_hp} onChange={e => setMachine(m => ({ ...m, main_motor_hp: e.target.value }))} />
        <Input placeholder="Location" value={machine.location} onChange={e => setMachine(m => ({ ...m, location: e.target.value }))} />
        <Input placeholder="WhatsApp Number" value={machine.whatsapp_number} onChange={e => setMachine(m => ({ ...m, whatsapp_number: e.target.value }))} />
        <VideoImageInputs label="Videos" files={machineVideos} setFiles={setMachineVideos} accept="video/*" />
        <VideoImageInputs label="Images" files={machineImages} setFiles={setMachineImages} accept="image/*" />
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Used Machine'}</Button>
      </form>
    </div>
  );
} 