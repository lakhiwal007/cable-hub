import React, { useState, useRef, useEffect } from 'react';
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

  const [showVideoModalIndex, setShowVideoModalIndex] = useState<number|null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const openVideoModal = async (index: number) => {
    setShowVideoModalIndex(index);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
    } catch (err) {
      alert('Could not access camera.');
      setShowVideoModalIndex(null);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModalIndex(null);
    setRecording(false);
    setRecordedChunks([]);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;
    const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };

  const useRecordedVideo = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const file = new File([blob], `recorded-${Date.now()}.webm`, { type: 'video/webm' });
    const newFiles = [...machineVideos];
    if (showVideoModalIndex !== null) newFiles[showVideoModalIndex] = file;
    setMachineVideos(newFiles);
    closeVideoModal();
  };

  useEffect(() => {
    if (showVideoModalIndex !== null && liveVideoRef.current && mediaStream) {
      liveVideoRef.current.srcObject = mediaStream;
    }
  }, [showVideoModalIndex, mediaStream, recording]);

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
        <div>
          <label className="block font-medium mb-1">Videos</label>
          {[0,1,2].map(i => (
            <div key={i} className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  id={`video-upload-${i}`}
                  onChange={e => {
                    const newFiles = [...machineVideos];
                    newFiles[i] = e.target.files?.[0] || null;
                    setMachineVideos(newFiles);
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-gray-200 text-gray-800 flex items-center gap-1"
                  onClick={() => document.getElementById(`video-upload-${i}`).click()}
                >
                  <span>Upload Video</span>
                </button>
                <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => openVideoModal(i)}>Record Video</button>
                {machineVideos[i] && (
                  <>
                    <span className="text-xs text-gray-600">{machineVideos[i].name}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => {
                        const newFiles = [...machineVideos];
                        newFiles[i] = null;
                        setMachineVideos(newFiles);
                      }}
                      title="Remove video"
                    >
                      &#128465;
                    </button>
                  </>
                )}
              </div>
              {machineVideos[i] && (
                <video controls className="mb-2 h-32 rounded border object-contain">
                  <source src={URL.createObjectURL(machineVideos[i])} type={machineVideos[i].type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {/* Modal for recording */}
              {showVideoModalIndex === i && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                    <button className="absolute top-2 right-2 text-gray-500" onClick={closeVideoModal}>&times;</button>
                    <h3 className="text-lg font-semibold mb-2">Record Video</h3>
                    {!recording && recordedChunks.length === 0 && (
                      <video ref={liveVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded mb-2" />
                    )}
                    {recording && (
                      <video ref={liveVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded mb-2 border-2 border-red-500" />
                    )}
                    {!recording && recordedChunks.length > 0 && (
                      <video
                        ref={videoPreviewRef}
                        controls
                        className="w-full h-48 bg-black rounded mb-2"
                        src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
                      />
                    )}
                    <div className="flex gap-2 justify-center">
                      {!recording && recordedChunks.length === 0 && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startRecording}>Start Recording</button>
                      )}
                      {recording && (
                        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={stopRecording}>Stop Recording</button>
                      )}
                      {!recording && recordedChunks.length > 0 && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={useRecordedVideo}>Use This Video</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <VideoImageInputs label="Images" files={machineImages} setFiles={setMachineImages} accept="image/*" />
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Used Machine'}</Button>
      </form>
    </div>
  );
} 