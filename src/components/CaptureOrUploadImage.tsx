import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, RefreshCw } from "lucide-react";

interface CaptureOrUploadImageProps {
  onImageSelect: (file: File) => void;
  label?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

const CaptureOrUploadImage: React.FC<CaptureOrUploadImageProps> = ({
  onImageSelect,
  label = "Image",
  accept = "image/*",
  multiple = false,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (showCamera) {
      console.log("videoRef.current:", videoRef.current);
      console.log("canvasRef.current:", canvasRef.current);
    }
  }, [showCamera, videoRef.current, canvasRef.current]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => onImageSelect(file));
    }
  };

  const openCamera = async (mode?: 'user' | 'environment') => {
    const useMode = mode ?? facingMode;
    setError(null);
    setCapturedImage(null);
    setShowCamera(true);
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useMode } });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoReady(true);
          videoRef.current?.play();
        };
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
        video: { facingMode: { ideal: newMode } } 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoReady(true);
          videoRef.current?.play();
        };
      }
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setVideoReady(true);
            videoRef.current?.play();
          };
        }
      } catch (fallbackErr) {
        setError('Could not switch camera. Using current camera.');
      }
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setCapturedImage(null);
    setVideoReady(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("No video or canvas ref");
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      
      setCapturedImage(dataUrl);
      // Stop the video stream after capture
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      setVideoReady(false);
    } else {
      console.log("No 2d context on canvas");
    }
  };

  const handleConfirm = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `${Date.now()}.png`, { type: "image/png" });
        onImageSelect(file);
        closeCamera();
      }
    }, "image/png");
  };

  const handleRetake = () => {
    setCapturedImage(null);
    openCamera(); // Re-initialize the camera stream
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
          <Camera className="h-4 w-4" /> Capture Image
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
        multiple={multiple}
      />
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full relative flex flex-col items-center">
            <div className="absolute z-10 top-2 px-4 py-2 flex justify-between w-full gap-2">
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
                className="bg-black/40 rounded-full p-1 shadow hover:bg-black/60 z-10"
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
              {/* Always render the canvas for ref */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!capturedImage ? (
                <>
                  <video ref={videoRef} className="w-full rounded mb-2 bg-black" autoPlay playsInline />
                  <Button type="button" onClick={(e)=>{
                    e.preventDefault();
                    handleCapture();
                  }} className="w-full mt-2 flex items-center gap-2" disabled={!videoReady || !videoRef.current || !canvasRef.current}>
                    <Camera className="h-4 w-4" /> Capture
                  </Button>
                  {!videoReady && <div className="text-xs text-gray-500 mt-1">Loading camera...</div>}
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </>
              ) : (
                <>
                  <img src={capturedImage} alt="Captured" className="w-full rounded mb-2" />
                  <div className="flex gap-2 w-full">
                    <Button type="button" onClick={handleRetake} variant="outline" className="flex-1 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Retake
                    </Button>
                    <Button type="button" onClick={handleConfirm} className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-4 w-4" /> Use Photo
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

export default CaptureOrUploadImage;