import React, { useState, useRef, useEffect } from 'react';
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
    whatsapp_number: '', budget_min: '', budget_max: ''
  });
  const [stockVideos, setStockVideos] = useState([null, null, null]);
  const [stockImages, setStockImages] = useState([null, null, null]);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [showVideoModalIndex, setShowVideoModalIndex] = useState<number|null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const openVideoModal = async (index: number) => {
    setShowVideoModalIndex(index);
    try {
      // Try with preferred facingMode first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: facingMode } } 
      });
      setMediaStream(stream);
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
      } catch (fallbackErr) {
        alert('Could not access camera. Please check camera permissions.');
        setShowVideoModalIndex(null);
      }
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

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    try {
      // Try with new facingMode
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: newMode } } 
      });
      setMediaStream(stream);
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
      } catch (fallbackErr) {
        alert('Could not switch camera. Using current camera.');
      }
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
    const newFiles = [...stockVideos];
    if (showVideoModalIndex !== null) newFiles[showVideoModalIndex] = file;
    setStockVideos(newFiles);
    closeVideoModal();
  };

  useEffect(() => {
    if (showVideoModalIndex !== null && liveVideoRef.current && mediaStream) {
      liveVideoRef.current.srcObject = mediaStream;
    }
  }, [showVideoModalIndex, mediaStream, recording]);

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
        budget_min: stock.budget_min ? Number(stock.budget_min) : null,
        budget_max: stock.budget_max ? Number(stock.budget_max) : null,
        year_of_purchase: stock.year_of_purchase ? Number(stock.year_of_purchase) : null,
        video_urls: videoUrls,
        image_urls: imageUrls,
        whatsapp_number: stock.whatsapp_number,
      });
      toast({ title: 'Success', description: 'Dead stock listed successfully!' });
      setStock({ stock_name: '', cable_name: '', qty: '', size: '', year_of_purchase: '', location: '', whatsapp_number: '', budget_min: '', budget_max: '' });
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
        <Input placeholder="Budget Min (₹)" type="number" value={stock.budget_min} onChange={e => setStock(s => ({ ...s, budget_min: e.target.value }))} />
        <Input placeholder="Budget Max (₹)" type="number" value={stock.budget_max} onChange={e => setStock(s => ({ ...s, budget_max: e.target.value }))} />
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
                    const newFiles = [...stockVideos];
                    newFiles[i] = e.target.files?.[0] || null;
                    setStockVideos(newFiles);
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
                {stockVideos[i] && (
                  <>
                    <span className="text-xs text-gray-600">{stockVideos[i].name}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => {
                        const newFiles = [...stockVideos];
                        newFiles[i] = null;
                        setStockVideos(newFiles);
                      }}
                      title="Remove video"
                    >
                      &#128465;
                    </button>
                  </>
                )}
              </div>
              {stockVideos[i] && (
                <video controls className="mb-2 h-32 rounded border object-contain">
                  <source src={URL.createObjectURL(stockVideos[i])} type={stockVideos[i].type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {/* Modal for recording */}
              {showVideoModalIndex === i && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                    <button className="absolute top-2 right-2 text-gray-500" onClick={closeVideoModal}>&times;</button>
                    <h3 className="text-lg font-semibold mb-2">Record Video</h3>
                    <button className="mb-2 px-3 py-1 rounded bg-gray-300 text-gray-800" onClick={switchCamera} type="button">
                      Switch Camera
                    </button>
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
        <VideoImageInputs label="Images" files={stockImages} setFiles={setStockImages} accept="image/*" />
        <Button className='col-span-full' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Dead Stock'}</Button>
      </form>
    </div>
  );
} 