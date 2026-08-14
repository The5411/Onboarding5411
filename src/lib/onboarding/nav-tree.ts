// Modelo de contenido de toda la app de onboarding. La mayoría de esto vive
// como filas en Supabase (`tracks`/`nav_items`, ver content.queries.ts), pero
// estos tipos son la fuente de verdad tanto para lo que viene de la base
// como para los dos ítems que se quedan hardcodeados acá (ver SPECIAL_ITEMS
// más abajo, y el mapa visual de LogisticsFlowMap en FlowView.tsx).
import {
  Boxes,
  Building2,
  ClipboardList,
  FileText,
  Home,
  ListChecks,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
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

// Una etapa de "Flujo operativo". `adminSections`/`warehouseSections`
// reutilizan el mismo `DocSection` que el resto del contenido — cada
// actividad/bloque de la columna Administración o Warehouse es una tarjeta
// con título + HTML (los videos/audios se insertan como <iframe>/<audio>
// embebidos dentro de ese HTML).
export type FlowStage = {
  id: string;
  number: number;
  name: string;
  short: string;
  phaseVar: string;
  objective: string;
  responsible: string;
  adminSections: DocSection[];
  warehouseSections: DocSection[];
};

export type FaqItem = {
  id: string;
  q: string;
  a: string;
};

type BaseNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type NavItem =
  | (BaseNavItem & { view: "flow"; stages: FlowStage[]; faqs: FaqItem[] })
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
  ClipboardList,
  FileText,
  Home,
  ListChecks,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
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
// para saber cuánto del item ya se marcó como visto/hecho. checklist/flow
// tienen varios (un ítem, una etapa); doc/directory se tratan como una sola
// casilla ("¿ya lo leíste?"), de ahí el id genérico ".completado".
export function getLeafIds(item: NavItem): string[] {
  if (item.view === "checklist") {
    return item.items.map((leaf) => leaf.id);
  }
  if (item.view === "flow") {
    return item.stages.map((stage) => `${item.id}.${stage.id}`);
  }
  return [`${item.id}.completado`];
}
