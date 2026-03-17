import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface VideoOverlayProps {
  duration?: number;
  onComplete?: () => void;
}

const VIDEO_URL =
  "https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/overlay.mp4";

export function VideoOverlay({ duration = 2000, onComplete }: VideoOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const interval = 50;
    const step = (100 / duration) * interval;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      setFadingOut(true);
      const t = setTimeout(() => onComplete(), 300);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col bg-black transition-opacity duration-300 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        loop
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="mt-auto relative z-10 px-6 pb-8">
        <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
      </div>
    </div>
  );
}
