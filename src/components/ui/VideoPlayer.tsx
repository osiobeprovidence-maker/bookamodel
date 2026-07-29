import { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  playbackId: string;
  poster?: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
}

export default function VideoPlayer({ playbackId, poster, className = '', muted = false, loop = false, controls = true, playsInline = true, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = `https://stream.mux.com/${playbackId}.m3u8`;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playbackId]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster || `https://image.mux.com/${playbackId}/thumbnail.jpg`}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      autoPlay={autoPlay}
    />
  );
}
