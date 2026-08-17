import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { uploadContentImage } from "@/lib/supabase/uploadContentImage";

// Carrusel opcional de una tarjeta (DocSection.images) — hoy lo usa la
// tarjeta "Factorial" de Setup día 1, pero cualquier tarjeta puede tener uno.
// Antes de esto, esas URLs solo se podían cargar a mano por SQL.
export function SlideImagesEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadContentImage(file)));
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveAt = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">
          Carrusel de diapositivas (opcional)
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-destructive hover:underline"
          >
            Borrar todas
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="group relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-white"
            >
              <img
                src={src}
                alt={`Diapositiva ${i + 1}`}
                className="h-full w-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveAt(i, -1)}
                  disabled={i === 0}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Mover antes"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveAt(i, 1)}
                  disabled={i === images.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Mover después"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-destructive"
                  aria-label="Borrar diapositiva"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/40 disabled:opacity-60"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        {uploading ? "Subiendo..." : "Agregar diapositivas"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
