import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export function SlidesCarousel({ images }: { images: string[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (images.length === 0) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Carousel setApi={setApi} className="relative">
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={src}>
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <img
                  src={src}
                  alt={`Diapositiva ${i + 1}`}
                  className="aspect-video w-full object-contain"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 h-8 w-8 border-none bg-card/90 shadow" />
            <CarouselNext className="right-2 h-8 w-8 border-none bg-card/90 shadow" />
          </>
        )}
      </Carousel>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                current === i ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
