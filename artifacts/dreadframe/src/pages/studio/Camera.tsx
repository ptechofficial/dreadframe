import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SectionHeader, CinematicButton, Card } from '@/components/ui-custom';
import { Camera as CameraIcon, ShieldAlert } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

export default function Camera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { dispatch } = useProject();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoData(null);
    startCamera();
  };

  const usePhoto = () => {
    if (photoData) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { userPhotoUrl: photoData, mode: 'photo' } });
      // Describe the photo theoretically, then send to horror lab
      dispatch({ type: 'UPDATE_PROJECT', payload: { userPrompt: 'A horror story based on this uploaded subject.' } });
      setLocation('/studio/horror-lab');
    }
  };

  return (
    <div className="py-12 px-8 max-w-4xl mx-auto flex flex-col h-full">
      <SectionHeader 
        title="Subject Capture" 
        subtitle="Stare into the lens. Do not blink."
        className="mb-8"
      />

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <Card className="w-full max-w-2xl aspect-video bg-black border-2 border-border/80 relative overflow-hidden flex items-center justify-center">
          
          {/* Noise overlay always on top */}
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none z-20" />
          
          {/* Recording indicator */}
          {stream && !photoData && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-600 font-mono text-[10px] tracking-widest uppercase">REC</span>
            </div>
          )}

          {/* Viewfinder brackets */}
          <div className="absolute inset-4 border border-white/10 z-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40" />
          </div>

          {!stream && !photoData && !error && (
            <div className="text-center z-10 space-y-6">
              <CameraIcon className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <CinematicButton onClick={startCamera}>
                Enable Camera
              </CinematicButton>
            </div>
          )}

          {error && (
            <div className="text-center z-10 space-y-4 max-w-sm px-6">
              <ShieldAlert className="w-12 h-12 mx-auto text-destructive/80" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <CinematicButton variant="outline" onClick={startCamera}>Retry</CinematicButton>
            </div>
          )}

          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover z-10 filter grayscale contrast-125 ${!stream || photoData ? 'hidden' : 'block'}`}
          />
          
          {photoData && (
            <img src={photoData} alt="Captured" className="w-full h-full object-cover z-10 filter grayscale contrast-125 sepia-[0.2]" />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </Card>

        <div className="mt-8 flex gap-4 h-12">
          {stream && !photoData && (
            <CinematicButton onClick={capturePhoto} className="px-12 bg-white text-black hover:bg-white/90 border-white">
              Capture
            </CinematicButton>
          )}
          
          {photoData && (
            <>
              <CinematicButton variant="outline" onClick={retakePhoto}>
                Retake
              </CinematicButton>
              <CinematicButton onClick={usePhoto}>
                Use This Subject
              </CinematicButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
