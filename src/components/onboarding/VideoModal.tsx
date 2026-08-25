import { normalizeVideoUrl } from "@/lib/onboarding/video-embeds";

export function VideoModal({ src, onClose }: { src: string | null; onClose: () => void }) {
  if (!src) return null;
  const embedSrc = normalizeVideoUrl(src);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={embedSrc.includes("?") ? `${embedSrc}&autoplay=1` : `${embedSrc}?autoplay=1`}
            className="h-full w-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
