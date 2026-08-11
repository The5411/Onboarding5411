import { Check } from "lucide-react";
import warehouseVideo from "@/assets/WarehouseVideo.mp4";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { TRACKS } from "@/lib/onboarding/nav-tree";

export function HomeView({ onSelect }: { onSelect: (id: string) => void }) {
  const { getGroupProgress } = useOnboardingProgress();

  return (
    <div>
      {/* Hero con Video de Fondo */}
      <header className="relative overflow-hidden border-b border-border min-h-[420px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={warehouseVideo} type="video/mp4" />
          Tu navegador no soporta videos.
        </video>

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, oklch(0.97 0.015 240 / 0.85) 35%, oklch(0.97 0.015 240 / 0.3) 100%)`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.6 0.2 270 / 0.05), transparent 50%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--gradient-hero)" }} />
            Guía de Onboarding
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Onboarding{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              5411
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl font-medium">
            Bienvenido/a. Elegí un área en la barra lateral, o empezá por alguna de las secciones
            principales.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => {
            const { done, total } = getGroupProgress(track.id);
            const isComplete = total > 0 && done === total;
            const TrackIcon = track.icon;
            const firstItem = track.items[0];

            return (
              <button
                key={track.id}
                type="button"
                disabled={!firstItem}
                onClick={() => firstItem && onSelect(firstItem.id)}
                className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <TrackIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold">{track.label}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    {isComplete ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary" /> Completo
                      </>
                    ) : total > 0 ? (
                      <span>
                        {done}/{total} completados
                      </span>
                    ) : (
                      <span>Próximamente</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
