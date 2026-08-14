// "Flujo operativo". `stages`/`faqs` vienen de Supabase y son editables
// desde /admin (ver FlowContentEditor). `LogisticsFlowMap` de más abajo es
// la única parte que se quedó hardcodeada a propósito: es una pieza de
// diseño fija (imagen + hotspots posicionados en % de una grilla), no texto
// editable, así que no tiene sentido llevarla a la base.
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import {
  Check,
  ClipboardCheck,
  GraduationCap,
  PackageCheck,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import logisticsFlowAsset from "@/assets/proceso5411.png";
import DependeMarca from "@/assets/DependeMarca.png";
import mapa from "@/assets/Mapa.png";
import hero from "@/assets/Comunicacion.png";
import { AccordionSections } from "@/components/onboarding/AccordionSections";
import { ImageZoomModal } from "@/components/onboarding/ImageZoomModal";
import type { FaqItem, FlowStage } from "@/lib/onboarding/nav-tree";

const WAREHOUSE_ICONS: Record<string, LucideIcon> = {
  inbound: Truck,
  outbound: ClipboardCheck,
  shipping: PackageCheck,
};

export function FlowView({ stages, faqs }: { stages: FlowStage[]; faqs: FaqItem[] }) {
  const { progress: onboardingProgress, toggleItem } = useOnboardingProgress();
  const [active, setActive] = useState<string>(stages[0]?.id ?? "");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(stages.map((s) => [s.id, true])),
  );
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    stages.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [stages]);

  const filtered = useMemo(() => {
    if (!query.trim()) return stages;
    const q = query.toLowerCase();
    return stages.filter((s) => JSON.stringify(s).toLowerCase().includes(q));
  }, [query, stages]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeIndex = stages.findIndex((s) => s.id === active);
  const progress = stages.length > 0 ? ((activeIndex + 1) / stages.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--gradient-hero)" }}
        />
      </div>

      {/* Interactive logistics flow roadmap */}
      <LogisticsFlowMap onJump={scrollTo} />

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <main className="min-w-0">
          {/* Search bar */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar etapa, documento, actividad..."
              className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 text-xs">
              <a
                href="#faq"
                className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary"
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Flow diagram */}
          <section className="mb-16 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-1 text-xl font-bold">Mapa del proceso</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Flujo end-to-end con dependencias entre etapas
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {stages.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => scrollTo(s.id)}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold text-white"
                      style={{ background: `var(${s.phaseVar})` }}
                    >
                      {s.number}
                    </span>
                    <span className="text-xs font-medium">{s.name}</span>
                  </button>
                  {i < stages.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Stages */}
          <div className="space-y-12">
            {filtered.map((s) => {
              const isOpen = expanded[s.id] ?? true;
              const leafId = `wholesale.flujo.${s.id}`;
              const isDone = !!onboardingProgress[leafId];
              const WhIcon = WAREHOUSE_ICONS[s.id] ?? Warehouse;
              return (
                <div key={s.id}>
                  <section
                    id={s.id}
                    className="scroll-mt-8 rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]"
                  >
                    {/* Header */}
                    <div
                      className="relative p-6 md:p-8"
                      style={{
                        background: `linear-gradient(135deg, var(${s.phaseVar}) 0%, oklch(from var(${s.phaseVar}) calc(l - 0.1) c h) 100%)`,
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 text-white">
                        <div>
                          <h2 className="mt-1 text-3xl font-bold md:text-4xl">{s.name}</h2>
                          <p className="mt-2 text-base opacity-90">{s.short}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItem(leafId)}
                            aria-pressed={isDone}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors ${
                              isDone
                                ? "bg-white text-foreground"
                                : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            {isDone ? "Completado" : "Marcar completado"}
                          </button>
                          <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))}
                            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/30"
                          >
                            {isOpen ? "Contraer −" : "Expandir +"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="space-y-8 p-6 md:p-8">
                        {/* Objective banner — common to both areas */}
                        <div className="rounded-xl border border-border bg-background p-5">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Objetivo de la etapa
                          </div>
                          <p className="mt-2 text-base leading-relaxed">{s.objective}</p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="relative rounded-2xl border border-border bg-card/60 p-4">
                            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                              <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
                                style={{ background: "var(--gradient-hero)" }}
                              >
                                <ClipboardCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                  Perspectiva
                                </div>
                                <h3 className="text-lg font-bold">Administración</h3>
                                <p className="text-xs text-muted-foreground">
                                  Responsable: {s.responsible}
                                </p>
                              </div>
                            </div>
                            <AccordionSections sections={s.adminSections} />
                          </div>

                          <div className="relative overflow-hidden rounded-2xl border border-border p-5 md:p-6">
                            <WhIcon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-[0.07]" />
                            <div className="relative mb-4 flex items-center gap-2 border-b border-border pb-3">
                              <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
                                style={{
                                  background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                                }}
                              >
                                <WhIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                  Perspectiva
                                </div>
                                <h3 className="text-lg font-bold">Warehouse</h3>
                              </div>
                            </div>
                            <div className="relative">
                              <AccordionSections sections={s.warehouseSections} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {(s.id === "inbound" || s.id === "outbound") && (
                    <div className="mt-4 flex justify-center">
                      <Link
                        to="/simulacro/$stage"
                        params={{ stage: s.id }}
                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                        }}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Hacer simulacro de {s.name}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No se encontraron etapas para "{query}".
              </div>
            )}
          </div>

          {/* FAQ */}
          <section id="faq" className="mt-16 scroll-mt-8">
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

          <footer className="mt-20 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            Onboarding 5411 — Guía interactiva operativa
          </footer>
        </main>
      </div>
    </div>
  );
}

// Pasos visuales sobre la imagen del roadmap — son más granulares que las 3
// secciones reales (`stages` trae inbound/outbound/returns). El hover
// siempre muestra la descripción, pero el click (`onJump`→scrollIntoView)
// solo hace algo si `targetId` matchea un `stage.id` real; "control-arribo"
// y "batches" no tienen sección propia, así que esos dos no scrollean a
// ningún lado al hacer click (comportamiento preexistente).
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
