export function ImageZoomModal({
  image,
  onClose,
}: {
  image: { src: string; alt: string } | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="max-h-[85vh] w-full overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
          <img
            src={image.src}
            alt={image.alt}
            className="h-auto w-full max-h-[85vh] object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}
