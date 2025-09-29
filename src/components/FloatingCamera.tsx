import { useEffect, useRef, useState } from "react";
import { X, Move, Mic, MicOff, Camera, CameraOff, Minimize2, Maximize2 } from "lucide-react";

type Props = {
  stream: MediaStream | null;
  onClose: () => void;
};

const FloatingCamera = ({ stream, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 16, y: 96 });
  const [muted, setMuted] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const resizeRef = useRef<{ resizing: boolean; startX: number; startY: number; startW: number; startH: number }>({ resizing: false, startX: 0, startY: 0, startW: 0, startH: 0 });
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 224, h: 160 });
  const dragRef = useRef<{ dx: number; dy: number; dragging: boolean }>({ dx: 0, dy: 0, dragging: false });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
      // Apply mute
      videoRef.current.muted = true;
      setMuted(true);
    }
  }, [stream]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current.dragging = true;
    dragRef.current.dx = e.clientX - pos.x;
    dragRef.current.dy = e.clientY - pos.y;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragRef.current.dragging = true;
    dragRef.current.dx = t.clientX - pos.x;
    dragRef.current.dy = t.clientY - pos.y;
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!dragRef.current.dragging) return;
    const t = e.touches[0];
    const x = t.clientX - dragRef.current.dx;
    const y = t.clientY - dragRef.current.dy;
    setPos({ x: Math.max(8, x), y: Math.max(8, y) });
  };
  const handleTouchEnd = () => {
    dragRef.current.dragging = false;
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  const toggleMute = () => {
    const tracks = stream?.getAudioTracks?.() || [];
    tracks.forEach(t => t.enabled = !t.enabled);
    setMuted(prev => !prev);
  };

  const toggleCamera = () => {
    const tracks = stream?.getVideoTracks?.() || [];
    tracks.forEach(t => t.enabled = !t.enabled);
    setCamOn(prev => !prev);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current.resizing = true;
    resizeRef.current.startX = e.clientX;
    resizeRef.current.startY = e.clientY;
    resizeRef.current.startW = dimensions.w;
    resizeRef.current.startH = dimensions.h;
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', endResize);
  };
  const onResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current.resizing) return;
    const dw = e.clientX - resizeRef.current.startX;
    const dh = e.clientY - resizeRef.current.startY;
    const w = Math.max(160, resizeRef.current.startW + dw);
    const h = Math.max(120, resizeRef.current.startH + dh);
    setDimensions({ w, h });
  };
  const endResize = () => {
    resizeRef.current.resizing = false;
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', endResize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const x = e.clientX - dragRef.current.dx;
    const y = e.clientY - dragRef.current.dy;
    setPos({ x: Math.max(8, x), y: Math.max(8, y) });
  };

  const handleMouseUp = () => {
    dragRef.current.dragging = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 rounded-lg overflow-hidden border border-border bg-card/95 backdrop-blur shadow-lg"
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label="Camera preview"
    >
      <div className="flex items-center justify-between px-2 py-1 text-xs select-none">
        <div className="inline-flex items-center gap-1 text-muted-foreground cursor-move" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
          <Move className="h-3 w-3" />
          Drag
        </div>
        {/* Top bar only for dragging; controls moved below */}
        <div />
      </div>
      <div className="bg-black relative" style={{ width: dimensions.w, height: dimensions.h }}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        <button onMouseDown={startResize} className="absolute right-1 bottom-1 w-4 h-4 cursor-se-resize bg-white/70 rounded-sm" aria-label="Resize" />
      </div>
      <div className="flex items-center justify-between px-2 py-1 gap-2">
        <div className="text-[10px] text-muted-foreground">Camera</div>
        <div className="inline-flex items-center gap-1">
          <button onClick={toggleMute} className="p-1.5 rounded hover:bg-secondary/50" aria-label="Toggle mute">
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button onClick={toggleCamera} className="p-1.5 rounded hover:bg-secondary/50" aria-label="Toggle camera">
            {camOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary/50" aria-label="Hide camera">
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCamera;


