// "Flujo operativo": mapa visual (hardcodeado, ver nota abajo) + intro y FAQ
// editables desde /admin. Cada etapa (Inbound, Outbound, Returns, Crossdock)
// es su propia subsección con vista propia — no vive acá, ver StageView.tsx.
import { useState } from "react";
import { AccordionSections } from "@/components/onboarding/AccordionSections";
import { ImageZoomModal } from "@/components/onboarding/ImageZoomModal";
import type { DocSection, FaqItem } from "@/lib/onboarding/nav-tree";
import logisticsFlowAsset from "@/assets/proceso5411.png";
import DependeMarca from "@/assets/DependeMarca.png";
import mapa from "@/assets/Mapa.png";
import hero from "@/assets/Comunicacion.png";

// Hotspots del mapa → id de la subsección a la que navegan. Los hotspots 3
// ("Escanean las cajas") y 4 ("Rearman las cajas") no tienen subsección
// propia, así que no navegan a ningún lado al hacer click (comportamiento
// preexistente; el hover sigue mostrando su descripción de todas formas).
const STAGE_ID_BY_HOTSPOT_TARGET: Record<string, string> = {
  inbound: "wholesale.flujo.inbound",
  outbound: "wholesale.flujo.outbound",
  shipping: "wholesale.flujo.returns",
};

export function FlowView({
  intro,
  faqs,
  onSelect,
}: {
  intro: DocSection[];
  faqs: FaqItem[];
  onSelect: (id: string) => void;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToStage = (hotspotTargetId: string) => {
    const stageId = STAGE_ID_BY_HOTSPOT_TARGET[hotspotTargetId];
    if (stageId) onSelect(stageId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LogisticsFlowMap onJump={goToStage} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <main className="min-w-0 space-y-16">
          <AccordionSections sections={intro} />

          <section id="faq" className="scroll-mt-8">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                FAQ
              </div>
              <h2 className="mt-1 text-3xl font-bold">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-2">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.id}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
                    >
                      <span className="text-sm font-semibold">{f.q}</span>
                      <span className={`text-xl transition-transform ${open ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {open && (
                      <div className="border-t border-border bg-secondary/20 px-5 py-4 text-sm text-muted-foreground">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const FLOW_HOTSPOTS: {
  number: number;
  title: string;
  description: string;
  targetId: string;
  phaseVar: string;
}[] = [
  {
    number: 1,
    title: "Llega el camión / avión",
    description:
      "Inbound: DHL, UPS o freight entregan la mercadería. El cliente envió previamente el Packing List y se creó el ASN en Mintsoft.",
    targetId: "inbound",
    phaseVar: "--phase-1",
  },
  {
    number: 2,
    title: "Llega al depósito",
    description:
      "Descarga de cajas en el warehouse 5411. Verificación física de cantidades y comparación contra el ASN cargado.",
    targetId: "inbound",
    phaseVar: "--phase-2",
  },
  {
    number: 3,
    title: "Escanean las cajas",
    description:
      "Escaneo de labels y registro en sistema. Validación de tracking number y SKU contra el catálogo.",
    targetId: "control-arribo",
    phaseVar: "--phase-3",
  },
  {
    number: 4,
    title: "Rearman las cajas",
    description:
      "Pick & Pack: apertura de cajas, búsqueda de productos y armado de nuevas cajas según órdenes Major y Boutique.",
    targetId: "batches",
    phaseVar: "--phase-5",
  },
  {
    number: 5,
    title: "Etiquetan y preparan envío",
    description:
      "Generación de labels, tracking number y commercial invoice. Preparación de las cajas para el pickup del carrier.",
    targetId: "outbound",
    phaseVar: "--phase-6",
  },
  {
    number: 6,
    title: "Despachan las cajas",
    description:
      "Shipping outbound: UPS, TForce Freight u otro carrier retira la mercadería. Salida del warehouse rumbo al cliente final.",
    targetId: "shipping",
    phaseVar: "--phase-8",
  },
];

function LogisticsFlowMap({ onJump }: { onJump: (id: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<"marca" | "envio" | "mapa" | null>(null);
  const active = hovered ?? 1;
  const activeHotspot = FLOW_HOTSPOTS.find((h) => h.number === active)!;

  return (
    <section className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 md:py-16">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Roadmap visual
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              5411 Logistics Flow
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Recorrido físico de la mercadería dentro del warehouse, de izquierda a derecha. Pasá
              el mouse o tocá cada etapa para ver el detalle y saltar a la sección operativa.
            </p>
          </div>
          <div className="hidden text-xs text-muted-foreground md:block">
            Inbound → Recepción → Escaneo → Pick &amp; Pack → Etiquetado → Outbound
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
          <img
            src={logisticsFlowAsset}
            alt="Flujo logístico 5411: inbound, recepción, escaneo, pick and pack, etiquetado y outbound"
            className="block w-full select-none"
            draggable={false}
          />

          <div className="absolute inset-0 grid grid-cols-6">
            {FLOW_HOTSPOTS.map((h) => {
              const isActive = active === h.number;
              return (
                <button
                  key={h.number}
                  type="button"
                  onMouseEnter={() => setHovered(h.number)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(h.number)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onJump(h.targetId)}
                  aria-label={`Etapa ${h.number}: ${h.title}. Ir a la sección`}
                  className="group relative cursor-pointer transition-colors"
                  style={{
                    background: isActive
                      ? `linear-gradient(180deg, color-mix(in oklch, var(${h.phaseVar}) 18%, transparent), transparent 70%)`
                      : "transparent",
                  }}
                >
                  {h.number === 4 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setActiveModalImage("marca");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setActiveModalImage("marca");
                        }
                      }}
                      aria-label="Depende de la Marca. Abrir modal"
                      className="absolute left-1/2 top-60 z-10 -translate-x-1/2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-8 py-3 text-sm font-bold text-primary-foreground whitespace-nowrap shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 cursor-pointer"
                    >
                      Depende de la Marca
                    </div>
                  )}

                  {h.number === 1 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setActiveModalImage("envio");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setActiveModalImage("envio");
                        }
                      }}
                      aria-label="La marca envía un cargamento. Abrir modal"
                      className="absolute left-1/2 top-63 z-10 -translate-x-1/2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-8 py-3 text-sm font-bold text-primary-foreground whitespace-nowrap shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 cursor-pointer"
                    >
                      Comunicación
                    </div>
                  )}
                  {h.number === 2 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setActiveModalImage("mapa");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setActiveModalImage("mapa");
                        }
                      }}
                      aria-label="Mapa Warehouse. Abrir modal"
                      className="absolute left-1/2 top-60 z-10 -translate-x-1/2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-8 py-3 text-sm font-bold text-primary-foreground whitespace-nowrap shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 cursor-pointer"
                    >
                      Mapa Warehouse
                    </div>
                  )}

                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-px opacity-30"
                    style={{ background: `var(${h.phaseVar})` }}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{ background: `var(${h.phaseVar})` }}
                  >
                    Ver paso {h.number} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ImageZoomModal
          image={
            activeModalImage
              ? {
                  src:
                    activeModalImage === "marca"
                      ? DependeMarca
                      : activeModalImage === "mapa"
                        ? mapa
                        : hero,
                  alt:
                    activeModalImage === "marca"
                      ? "Depende de la Marca"
                      : activeModalImage === "mapa"
                        ? "Mapa del Warehouse"
                        : "La marca envía un cargamento",
                }
              : null
          }
          onClose={() => setActiveModalImage(null)}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-[var(--shadow-soft)] transition-colors"
            style={{ background: `var(${activeHotspot.phaseVar})` }}
          >
            {activeHotspot.number}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Etapa {activeHotspot.number} de 6
            </div>
            <div className="text-lg font-semibold">{activeHotspot.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{activeHotspot.description}</p>
          </div>
          <button
            onClick={() => onJump(activeHotspot.targetId)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Ir a la sección →
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FLOW_HOTSPOTS.map((h) => (
            <button
              key={h.number}
              onMouseEnter={() => setHovered(h.number)}
              onFocus={() => setHovered(h.number)}
              onClick={() => onJump(h.targetId)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active === h.number
                  ? "border-transparent text-white shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:bg-secondary"
              }`}
              style={active === h.number ? { background: `var(${h.phaseVar})` } : undefined}
            >
              <span className="font-bold">{h.number}</span>
              <span>{h.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
