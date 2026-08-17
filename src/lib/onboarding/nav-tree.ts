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
export type StageContent = {
  short: string;
  phaseVar: string;
  objective: string;
  responsible: string;
  adminSections: DocSection[];
  warehouseSections: DocSection[];
};

export type NavItem =
  | (BaseNavItem & { view: "flow"; intro: DocSection[]; faqs: FaqItem[] })
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
