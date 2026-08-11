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
  | (BaseNavItem & { view: "doc"; sections: DocSection[] })
  | (BaseNavItem & { view: "directory"; dataSource: DirectoryDataSource })
  | (BaseNavItem & { view: "checklist"; items: ChecklistItem[] });

export type Track = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: NavItem[];
};

const PLACEHOLDER_SECTIONS: DocSection[] = [
  {
    id: "proximamente",
    title: "Contenido próximamente",
    html: "<p>Esta sección todavía no tiene contenido cargado. Se va a completar en una próxima iteración.</p>",
  },
];

function placeholderDoc(id: string, label: string, icon: LucideIcon): NavItem {
  return { id, label, icon, view: "doc", sections: PLACEHOLDER_SECTIONS };
}

function placeholderDirectory(
  id: string,
  label: string,
  icon: LucideIcon,
  columns: DirectoryColumn[],
): NavItem {
  return {
    id,
    label,
    icon,
    view: "directory",
    dataSource: { type: "static", columns, rows: [] },
  };
}

// Las imágenes se sirven desde /public/images — guardá los 3 archivos ahí con estos nombres exactos:
//   public/images/historia-5411.png
//   public/images/organigrama-buenos-aires.png
//   public/images/organigrama-dallas.png
const NOSOTROS_SECTIONS: DocSection[] = [
  {
    id: "mision-vision-valores",
    title: "Misión, Visión y Valores",
    html: `<p>Somos un proveedor logístico con un servicio al cliente basado en la excelencia.</p>
<p>Nuestra misión es brindar soluciones logísticas eficientes, innovadoras y confiables.</p>`,
  },
  {
    id: "que-hacemos",
    title: "¿Qué hacemos?",
    html: `<p>Somos una 3PL (Third Party Logistics), socios estratégicos dentro de la Supply Chain de nuestros clientes.</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Recibimos y manejamos stock.</li>
  <li>Procesamos y preparamos las órdenes de nuestros clientes para que sean entregadas en tiempo y forma.</li>
  <li>Atención al cliente: los mantenemos informados de todo lo que va pasando con sus cargamentos y órdenes.</li>
  <li>Back office: ofrecemos servicio de contacto a clientes finales, cobros de órdenes a Specialty stores, y pedidos de materiales necesarios para el despacho de las órdenes.</li>
</ul>`,
  },
  {
    id: "historia",
    title: "Historia",
    html: `<img src="/images/historia-5411.png" alt="Línea de tiempo 5411, 2011–2025" class="w-full rounded-xl border border-border" />`,
  },
  {
    id: "fortalezas",
    title: "Nuestras fortalezas",
    html: `<ul class="list-disc space-y-2 pl-5">
  <li><strong class="text-foreground">Administración de inventario:</strong> transparencia y profesionalismo en la recepción, consolidación, control y despacho de inventario. Agilidad en despacho y facturación.</li>
  <li><strong class="text-foreground">Soluciones integrales:</strong> brindamos soluciones a sus problemas minimizando costos y tiempos de respuesta. Soluciones rápidas.</li>
  <li><strong class="text-foreground">Atención al cliente exclusiva:</strong> account managers que brindan un servicio personalizado y con comunicación fluida.</li>
</ul>`,
  },
  {
    id: "como-llegamos",
    title: "¿Cómo llegamos a nuestros clientes?",
    html: `<ul class="list-disc space-y-2 pl-5">
  <li><strong class="text-foreground">Boca en boca:</strong> método más eficiente; nos contactan a través de showrooms, boutiques, Hilldun, etc.</li>
  <li><strong class="text-foreground">Ferias:</strong> nos presentamos en ferias donde participan nuestros actuales y potenciales clientes.</li>
  <li><strong class="text-foreground">Contacto directo:</strong> visitas o búsquedas directas.</li>
</ul>`,
  },
];

const EQUIPO_SECTIONS: DocSection[] = [
  {
    id: "organigrama-buenos-aires",
    title: "Organigrama Buenos Aires",
    html: `<img src="/images/organigrama-buenos-aires.png" alt="Organigrama The 5411 — Buenos Aires" class="w-full rounded-xl border border-border bg-white p-2" />`,
  },
  {
    id: "organigrama-dallas",
    title: "Organigrama Dallas",
    html: `<img src="/images/organigrama-dallas.png" alt="Organigrama Dallas" class="w-full max-w-sm rounded-xl border border-border bg-white p-2" />`,
  },
];

export const HOME_ID = "home";

export const TRACKS: Track[] = [
  {
    id: "empresa",
    label: "Empresa",
    icon: Building2,
    defaultOpen: false,
    items: [
      {
        id: "empresa.nosotros",
        label: "Nosotros",
        icon: Sparkles,
        view: "doc",
        sections: NOSOTROS_SECTIONS,
      },
      {
        id: "empresa.equipo",
        label: "Equipo",
        icon: Users,
        view: "doc",
        sections: EQUIPO_SECTIONS,
      },
      {
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
      placeholderDoc("empresa.politicas", "Políticas y beneficios", FileText),
      {
        id: "empresa.setup-dia-1",
        label: "Setup día 1",
        icon: ListChecks,
        view: "checklist",
        items: [],
      },
    ],
  },
  {
    id: "wholesale",
    label: "Wholesale",
    icon: Package,
    defaultOpen: true,
    items: [
      { id: "wholesale.flujo", label: "Flujo operativo", icon: Boxes, view: "flow" },
      placeholderDoc("wholesale.sops-clientes", "SOPs Clientes", FileText),
      placeholderDoc("wholesale.sops-majors", "SOPs Majors", FileText),
      placeholderDoc("wholesale.handbook", "Handbook Wholesale", ClipboardList),
      placeholderDoc("wholesale.armado-ordenes", "Armado de Órdenes", ClipboardList),
      placeholderDirectory("wholesale.responsables-marca", "Responsables de Marca", Users, [
        { key: "marca", label: "Marca" },
        { key: "responsable", label: "Responsable" },
        { key: "contacto", label: "Contacto" },
      ]),
      placeholderDirectory("wholesale.contact-list", "Contact List", Phone, [
        { key: "nombre", label: "Nombre" },
        { key: "rol", label: "Rol" },
        { key: "contacto", label: "Contacto" },
      ]),
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: ShoppingBag,
    defaultOpen: false,
    items: [placeholderDoc("ecommerce.proximamente", "Próximamente", Sparkles)],
  },
];

export const HOME_ICON = Home;

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

export const LEAF_IDS_BY_TRACK: Record<string, string[]> = Object.fromEntries(
  TRACKS.map((track) => [track.id, track.items.flatMap(getLeafIds)]),
);

export function findNavItem(itemId: string): { track: Track; item: NavItem } | null {
  for (const track of TRACKS) {
    const item = track.items.find((candidate) => candidate.id === itemId);
    if (item) return { track, item };
  }
  return null;
}
