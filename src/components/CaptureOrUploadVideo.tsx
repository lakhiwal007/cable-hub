import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, RefreshCw } from "lucide-react";

interface CaptureOrUploadVideoProps {
  onVideoSelect: (file: File) => void;
  label?: string;
  accept?: string;
  className?: string;
  maxDuration?: number; // in seconds
}

const CaptureOrUploadVideo: React.FC<CaptureOrUploadVideoProps> = ({
  onVideoSelect,
  label = "Video",
  accept = "video/*",
  className = "",
  maxDuration = 30
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onVideoSelect(e.target.files[0]);
    }
  };

  const openCamera = async (mode?: 'user' | 'environment') => {
    const useMode = mode ?? facingMode;
    setError(null);
    setVideoUrl(null);
    setShowCamera(true);
    setRecordedChunks([]);
    setTimer(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useMode }, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Could not access camera. Please allow camera access or try a different device.");
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: newMode } }, audio: true 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (fallbackErr) {
        setError('Could not switch camera. Using current camera.');
      }
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setVideoUrl(null);
    setRecordedChunks([]);
    setRecording(false);
    setTimer(0);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;
    setRecordedChunks([]);
    setRecording(true);
    setTimer(0);
    const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/mp4' });
    setMediaRecorder(recorder);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };
    recorder.start();
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev + 1 >= maxDuration) {
          stopRecording();
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRetake = () => {
    setVideoUrl(null);
    setRecordedChunks([]);
    setRecording(false);
    setTimer(0);
    openCamera();
  };

  const handleConfirm = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/mp4' });
    const file = new File([blob], `${Date.now()}.mp4`, { type: 'video/mp4' });
    onVideoSelect(file);
    closeCamera();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => openCamera()}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" /> Record Video
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> Choose File
        </Button>
      </div>
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full relative flex flex-col items-center">
            <div className="absolute w-full z-10 top-2 px-4 py-2 flex justify-between gap-2">
              <button
                type="button"
                className="bg-black/40 rounded-full p-1 shadow hover:bg-black/60 z-10"
                onClick={() => switchCamera()}
                aria-label="Switch camera"
              >
                <RefreshCw className="h-6 w-6 text-white" />
              </button>
              <button
                type="button"
                className="bg-black/40 backdrop-blur-sm rounded-full p-1 shadow hover:bg-black/60 z-10"
                onClick={(e)=>{
                  e.preventDefault();
                  closeCamera();
                }}
                aria-label="Close"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="w-full flex flex-col items-center">
              {!videoUrl ? (
                <>
                  <video ref={videoRef} className="w-full rounded mb-2 bg-black" autoPlay playsInline muted />
                  <div className="flex gap-2 w-full mt-2">
                    {!recording ? (
                      <Button type="button" onClick={startRecording} className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                        <Camera className="h-4 w-4" /> Start Recording
                      </Button>
                    ) : (
                      <Button type="button" onClick={stopRecording} className="flex-1 flex items-center gap-2 bg-red-600 hover:bg-red-700">
                        <Camera className="h-4 w-4" /> Stop
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{recording ? `Recording... ${timer}s` : `Max duration: ${maxDuration}s`}</div>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </>
              ) : (
                <>
                  <div className="relative w-full mb-2">
                    <video src={videoUrl} controls className="w-full rounded" />
                    
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button type="button" onClick={handleRetake} variant="outline" className="flex-1 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Retake
                    </Button>
                    <Button type="button" onClick={handleConfirm} className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-4 w-4" /> Use Video
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureOrUploadVideo; 