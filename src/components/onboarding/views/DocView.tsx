import { useState } from "react";
import type { DocSection } from "@/lib/onboarding/nav-tree";

export function DocView({ sections }: { sections: DocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

  const scrollTo = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setZoomedImage({ src: img.src, alt: img.alt });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h2 className="mb-3 text-xl font-bold">{section.title}</h2>
            <div
              className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_img]:cursor-zoom-in [&_img]:transition-transform [&_img]:hover:scale-[1.01]"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}
      </div>

      {sections.length > 1 && (
        <nav className="hidden lg:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              En esta página
            </div>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      activeId === section.id
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="max-h-[85vh] w-full overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
              <img
                src={zoomedImage.src}
                alt={zoomedImage.alt}
                className="h-auto w-full max-h-[85vh] object-contain"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
