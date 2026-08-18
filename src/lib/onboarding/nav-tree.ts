// Modelo de contenido de toda la app de onboarding. La mayoría de esto vive
// como filas en Supabase (`tracks`/`nav_items`, ver content.queries.ts), pero
// estos tipos son la fuente de verdad tanto para lo que viene de la base
// como para los dos ítems que se quedan hardcodeados acá (ver SPECIAL_ITEMS
// más abajo, y el mapa visual de LogisticsFlowMap en FlowView.tsx).
import {
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  ListChecks,
  LogOut,
  Package,
  PackageCheck,
  Phone,
  ShoppingBag,
  Sparkles,
  TreePalm,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DocSection = {
  id: string;
  title: string;
  html: string;
  // Rutas de imágenes (una por diapositiva) para mostrar como carrusel propio,
  // sin depender del embed de Google Slides.
  images?: string[];
  // Marca la tarjeta como un llamado de atención (p.ej. "Puntos críticos /
  // Validaciones"): la pinta con acento rojo en vez del estilo neutro default.
  accent?: "warning";
};

export type DirectoryColumn = {
  key: string;
  label: string;
};

export type DirectoryDataSource =
  | { type: "static"; columns: DirectoryColumn[]; rows: Record<string, string>[] }
  | { type: "sheet"; visibleColumns?: string[] };

export type ChecklistItem = {
  id: string;
  label: string;
  href?: string;
};

export type FaqItem = {
  id: string;
  q: string;
  a: string;
};

// Textos e imágenes editables del mapa visual de Flujo operativo
// (LogisticsFlowMap, en FlowView.tsx). La imagen de fondo y la posición de
// cada hotspot se quedan hardcodeadas (dependen una de la otra: mover la
// imagen sin mover el hotspot lo desalinea) — solo título/descripción de
// cada paso y las 3 imágenes de los modales son "contenido" real.
export type RoadmapContent = {
  hotspots: { number: number; title: string; description: string }[];
  modalImages: { marca: string; mapa: string; envio: string };
};

// Fallback si todavía no se corrió la migración que carga esto en Supabase
// (o si a alguien se le borra por error) — mismo texto/imágenes que había
// hardcodeado antes, para que la página nunca se vea vacía.
export const DEFAULT_ROADMAP_CONTENT: RoadmapContent = {
  hotspots: [
    {
      number: 1,
      title: "Llega el camión / avión",
      description:
        "Inbound: DHL, UPS o freight entregan la mercadería. El cliente envió previamente el Packing List y se creó el ASN en Mintsoft.",
    },
    {
      number: 2,
      title: "Llega al depósito",
      description:
        "Descarga de cajas en el warehouse 5411. Verificación física de cantidades y comparación contra el ASN cargado.",
    },
    {
      number: 3,
      title: "Escanean las cajas",
      description:
        "Escaneo de labels y registro en sistema. Validación de tracking number y SKU contra el catálogo.",
    },
    {
      number: 4,
      title: "Rearman las cajas",
      description:
        "Pick & Pack: apertura de cajas, búsqueda de productos y armado de nuevas cajas según órdenes Major y Boutique.",
    },
    {
      number: 5,
      title: "Etiquetan y preparan envío",
      description:
        "Generación de labels, tracking number y commercial invoice. Preparación de las cajas para el pickup del carrier.",
    },
    {
      number: 6,
      title: "Despachan las cajas",
      description:
        "Shipping outbound: UPS, TForce Freight u otro carrier retira la mercadería. Salida del warehouse rumbo al cliente final.",
    },
  ],
  modalImages: {
    marca: "/images/roadmap/depende-marca.png",
    mapa: "/images/roadmap/mapa-warehouse.png",
    envio: "/images/roadmap/comunicacion.png",
  },
};

type BaseNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  // Subsecciones (nav_items con parent_id apuntando a este item). Cualquier
  // item puede tener hijos, sin importar su propio `view` — se crean/editan
  // desde /admin (ver NavStructureEditor), no hace falta tocar código.
  children?: NavItem[];
};

// Una etapa de "Flujo operativo" (Inbound, Outbound, Returns, Crossdock...)
// — hoy es una subsección de "wholesale.flujo", no un array embebido: cada
// etapa es su propio nav_item, con `label`/`id`/`position` propios y este
// contenido de dos columnas (Administración/Warehouse). Los videos/audios se
// insertan como <iframe>/<audio> embebidos dentro del HTML de cada tarjeta.
// Caja de texto simple (label + párrafo), mismo estilo visual que "Objetivo
// de la etapa". Se muestra debajo de las columnas Administración/Warehouse
// — para notas sueltas que no encajan como una tarjeta más de ninguna de
// las dos columnas.
export type StageNote = {
  id: string;
  label: string;
  text: string;
};

export type StageContent = {
  short: string;
  phaseVar: string;
  objective: string;
  responsible: string;
  adminSections: DocSection[];
  warehouseSections: DocSection[];
  notes?: StageNote[];
};

export type NavItem =
  | (BaseNavItem & {
      view: "flow";
      intro: DocSection[];
      faqs: FaqItem[];
      roadmap: RoadmapContent;
    })
  | (BaseNavItem & ({ view: "stage" } & StageContent))
  | (BaseNavItem & { view: "doc"; sections: DocSection[]; layout?: "flat" | "accordion" })
  | (BaseNavItem & { view: "directory"; dataSource: DirectoryDataSource })
  | (BaseNavItem & { view: "checklist"; items: ChecklistItem[] });

export type Track = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: NavItem[];
};

export const HOME_ID = "home";
export const HOME_ICON = Home;

// Traduce el `icon_name` guardado en Supabase (ej. "Sparkles") al componente
// de ícono real. Si agregás contenido nuevo desde el panel de Editor con un
// ícono que no está en este mapa, agregalo aquí también.
export const ICON_MAP: Record<string, LucideIcon> = {
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  ListChecks,
  LogOut,
  Package,
  PackageCheck,
  Phone,
  ShoppingBag,
  Sparkles,
  TreePalm,
  Truck,
  Users,
};

// Items que NO viven en Supabase: "Empleados" lee de un Google Sheet
// externo. `content.queries.ts` lo inserta en la posición que le corresponde
// dentro del track que llega desde la base.
export const SPECIAL_ITEMS: { id: string; trackId: string; position: number; item: NavItem }[] = [
  {
    id: "empresa.empleados",
    trackId: "empresa",
    position: 3,
    item: {
      id: "empresa.empleados",
      label: "Empleados",
      icon: Users,
      view: "directory",
      dataSource: {
        type: "sheet",
        visibleColumns: [
          "apellido",
          "nombre",
          "correo",
          "contraseña mail",
          "puesto",
          "numero de telefono",
        ],
      },
    },
  },
];

// IDs de "cosas marcables" dentro de un item, usados por useOnboardingProgress
// para saber cuánto del item ya se marcó como visto/hecho. Si el item tiene
// subsecciones, su progreso ES la suma del de sus hijos (no tiene sentido un
// ".completado" propio para lo que es básicamente una carpeta). checklist
// tiene varios leaves (uno por tarea); el resto (doc/directory/stage/flow
// sin hijos) se trata como una sola casilla ("¿ya lo leíste?").
export function getLeafIds(item: NavItem): string[] {
  if (item.children && item.children.length > 0) {
    return item.children.flatMap(getLeafIds);
  }
  if (item.view === "checklist") {
    return item.items.map((leaf) => leaf.id);
  }
  return [`${item.id}.completado`];
}
