"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_CLICK_SCALE = 2.5;
const WHEEL_SENSITIVITY = 0.0015;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1, offset: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ startOffset: { x: number; y: number }; startPoint: { x: number; y: number } } | null>(
    null,
  );
  const pinchRef = useRef<{ startScale: number; startDistance: number } | null>(null);

  const zoomAt = (point: { x: number; y: number }, targetScale: number) => {
    setTransform((prev) => {
      const newScale = clamp(targetScale, MIN_SCALE, MAX_SCALE);
      if (newScale === prev.scale) return prev;
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        offset: {
          x: point.x - (point.x - prev.offset.x) * ratio,
          y: point.y - (point.y - prev.offset.y) * ratio,
        },
      };
    });
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = Math.exp(-event.deltaY * WHEEL_SENSITIVITY);
      setTransform((prev) => {
        const newScale = clamp(prev.scale * factor, MIN_SCALE, MAX_SCALE);
        if (newScale === prev.scale) return prev;
        const ratio = newScale / prev.scale;
        return {
          scale: newScale,
          offset: {
            x: point.x - (point.x - prev.offset.x) * ratio,
            y: point.y - (point.y - prev.offset.y) * ratio,
          },
        };
      });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      pinchRef.current = { startScale: transform.scale, startDistance: Math.hypot(a.x - b.x, a.y - b.y) };
      dragRef.current = null;
      setIsDragging(false);
    } else if (pointersRef.current.size === 1 && transform.scale > 1) {
      dragRef.current = { startOffset: transform.offset, startPoint: { x: event.clientX, y: event.clientY } };
      setIsDragging(true);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [a, b] = Array.from(pointersRef.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const midpoint = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
      zoomAt(midpoint, pinchRef.current.startScale * (distance / pinchRef.current.startDistance));
    } else if (pointersRef.current.size === 1 && dragRef.current) {
      const drag = dragRef.current;
      const dx = event.clientX - drag.startPoint.x;
      const dy = event.clientY - drag.startPoint.y;
      setTransform((prev) => ({ ...prev, offset: { x: drag.startOffset.x + dx, y: drag.startOffset.y + dy } }));
    }
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      setIsDragging(false);
    }
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (transform.scale > 1) {
      setTransform({ scale: 1, offset: { x: 0, y: 0 } });
    } else {
      zoomAt({ x: event.clientX - rect.left, y: event.clientY - rect.top }, DOUBLE_CLICK_SCALE);
    }
  };

  const zoomed = transform.scale > 1;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={viewportRef}
        className="absolute inset-0 touch-none select-none"
        style={{ cursor: zoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `translate(${transform.offset.x}px, ${transform.offset.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <Image src={src} alt={alt} fill sizes="98vw" style={{ objectFit: "contain" }} draggable={false} />
        </div>
      </div>

      {zoomed && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-3 border border-foreground/20 bg-background px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground"
        >
          {Math.round(transform.scale * 100)}%
        </span>
      )}
    </div>
  );
}
