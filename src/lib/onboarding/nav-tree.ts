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

type BaseNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type NavItem =
  | (BaseNavItem & { view: "flow" })
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

// Items que NO viven en Supabase: "Flujo operativo" es JSX a medida
// (FlowView, con imágenes importadas y modales propios) y "Empleados" lee de
// un Google Sheet externo. `content.queries.ts` los inserta en la posición
// que les corresponde dentro del track que llega desde la base.
export const SPECIAL_ITEMS: { id: string; trackId: string; position: number; item: NavItem }[] = [
  {
    id: "wholesale.flujo",
    trackId: "wholesale",
    position: 1,
    item: { id: "wholesale.flujo", label: "Flujo operativo", icon: Boxes, view: "flow" },
  },
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

const FLOW_STAGE_IDS = ["inbound", "outbound", "shipping"];

export function getLeafIds(item: NavItem): string[] {
  if (item.view === "checklist") {
    return item.items.map((leaf) => leaf.id);
  }
  if (item.id === "wholesale.flujo") {
    return FLOW_STAGE_IDS.map((stageId) => `${item.id}.${stageId}`);
  }
  return [`${item.id}.completado`];
}
