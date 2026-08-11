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

// URL pública (no sensible) del embed de Google Slides con la guía de
// Factorial. Se lee de VITE_FACTORIAL_SLIDES_URL — configurala como
// variable de entorno en Railway (o en .env.local para desarrollo).
// Se fuerzan los parámetros de autoplay/loop para que se vea como una
// presentación que avanza sola, en vez de la pantalla interactiva de Slides.
function toAutoplaySlidesUrl(url: string): string {
  if (!url) return url;
  const base = url.split("?")[0];
  return `${base}?start=true&loop=true&delayms=4000`;
}

const FACTORIAL_SLIDES_EMBED_URL = toAutoplaySlidesUrl(
  import.meta.env.VITE_FACTORIAL_SLIDES_URL ?? "",
);

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

const SETUP_DIA_1_SECTIONS: DocSection[] = [
  {
    id: "canal-slack",
    title: "💬 Slack — comunicación diaria",
    html: `<p>Nuestro espacio principal de trabajo y charlas rápidas. El objetivo, en todos los canales, es mantenernos organizados, ágiles y que la información llegue siempre a tiempo.</p>
<p class="font-semibold text-foreground">Canales principales:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">#5411-dallas-bsas:</strong> comunicados oficiales, novedades de la empresa y recordatorios importantes con el equipo de Dallas.</li>
  <li><strong class="text-foreground">#5411:</strong> comunicados oficiales, novedades de la empresa y recordatorios importantes; solo el equipo de Buenos Aires, con Sofi y Martín.</li>
  <li><strong class="text-foreground">#employees:</strong> canal en el que están solo los empleados de Buenos Aires, sin Sofi y Martín.</li>
  <li><strong class="text-foreground">#almuerzos-y-planes:</strong> organización de almuerzos, afters o juntadas 🍕🍻.</li>
  <li><strong class="text-foreground">#[nombre de la marca]:</strong> hay un canal por cada marca. Cada empleado debe unirse al canal de la marca que le corresponda.</li>
</ul>`,
  },
  {
    id: "canal-whatsapp",
    title: "📱 WhatsApp — urgencias y logística inmediata",
    html: `<p>Hay un grupo de WhatsApp, <strong class="text-foreground">Employees 5411</strong>, solo para temas urgentes o para cuando alguien está fuera de Slack.</p>
<a href="https://chat.whatsapp.com/L2PI58V8QyO1VFwkpwe1jG" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
  Unirme al grupo de WhatsApp →
</a>
<p class="mt-2">Ejemplos: aviso de ausencia el mismo día, imprevistos en reuniones, cambios de última hora.</p>`,
  },
  {
    id: "canal-email",
    title: "📧 Email — documentación y comunicaciones formales",
    html: `<ul class="list-disc space-y-1.5 pl-5">
  <li>Contratos, certificaciones y políticas internas.</li>
  <li>Envío de documentos que requieran firma o respaldo oficial.</li>
</ul>
<p class="mt-3">Antes de entrar a trabajar en 5411 se te creará un mail de la empresa con una firma que tendrá tu nombre y tu puesto de trabajo (podés copiar el ejemplo de la imagen de abajo).</p>
<p>Te lo daremos con una contraseña que te pedirá cambiar al ingresar. Una vez que la hayas cambiado, enviá la nueva contraseña a <strong class="text-foreground">hr@the5411.com</strong>.</p>
<img src="/images/ejemplo-firma-mail.png" alt="Ejemplo de firma de mail" class="mt-2 w-full max-w-md rounded-xl border border-border bg-white p-2" />`,
  },
  {
    id: "canal-notion",
    title: "📚 Notion — repositorio central",
    html: `<p>Nuestro "manual vivo" de la empresa.</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Políticas internas y beneficios.</li>
  <li>Guías de onboarding y capacitaciones.</li>
  <li>Calendario de fechas importantes y feriados.</li>
  <li>Documentos de procesos.</li>
</ul>`,
  },
  {
    id: "factorial",
    title: "Factorial — Guía paso a paso",
    html: `<div class="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
  <iframe class="h-full w-full" src="${FACTORIAL_SLIDES_EMBED_URL}" allowfullscreen></iframe>
</div>

<h3 class="mt-4 text-base font-semibold text-foreground">Cargar tu información personal</h3>
<p>Ingresá a <strong class="text-foreground">Perfil</strong> (en el menú de la izquierda) y completá, en las solapas <strong class="text-foreground">Detalles laborales</strong> y <strong class="text-foreground">Detalles personales</strong>, todos los campos que se solicitan: mail personal, día de comienzo en 5411, número de serie de la computadora, vencimiento de visa, título, contacto de emergencia, alias bancario, etc. Todos los campos deben estar completos.</p>

<h3 class="mt-4 text-base font-semibold text-foreground">Cómo pedir vacaciones, viajes a Dallas, días de estudio, licencia por enfermedad y días remotos</h3>
<p>Aclará los motivos y las fechas. Todo debe estar completo. Una vez hecho este proceso, tu pedido pasará por un proceso de aprobación y vas a recibir la confirmación o el rechazo de tu solicitud.</p>

<h3 class="mt-4 text-base font-semibold text-foreground">Cómo linkear tu calendario con el calendario de Factorial</h3>
<p>El calendario de Factorial no se linkea automáticamente con tu calendario. Te recomendamos hacerlo para estar al día de todo lo que van haciendo los demás empleados.</p>`,
  },
];

const POLITICAS_SECTIONS: DocSection[] = [
  {
    id: "vacaciones",
    title: "Política de Vacaciones",
    html: `<p>La política de vacaciones de 5411 tiene como objetivo garantizar el descanso de los empleados, promoviendo el equilibrio entre la vida personal y laboral, asegurando al mismo tiempo la continuidad operativa de la empresa.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">1. Asignación de días de vacaciones</h2>
<h3 class="text-base font-semibold text-foreground">Empleados actuales</h3>
<p>Todos los empleados que ya se encuentran en 5411 mantendrán el beneficio de:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">15 días hábiles de vacaciones anuales a partir del año 2026.</strong></li>
  <li>Las vacaciones podrán tomarse en el momento que cada empleado lo desee, conforme a lo establecido por la política vigente y a la planificación del equipo. Sin embargo, no se permitirá concentrar todos los días pendientes para el cierre del año, salvo que dicha programación haya sido coordinada con la empresa con la debida anticipación y cuente con la aprobación correspondiente.</li>
  <li>Las vacaciones <strong class="text-foreground">no son acumulables</strong> y deben tomarse dentro del año calendario.</li>
  <li>Se otorga además <strong class="text-foreground">1 día hábil por cumpleaños</strong>, a tomar el mismo día o el primer día hábil anterior o posterior si cae en fin de semana o feriado.</li>
</ul>
<h3 class="mt-4 text-base font-semibold text-foreground">Empleados que ingresen a 5411</h3>
<p>Para los nuevos ingresos, las vacaciones se asignarán de manera proporcional:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Durante el año calendario que el empleado ingrese, generará <strong class="text-foreground">1 día de vacaciones cada 20 días hábiles trabajados</strong>. Al próximo año calendario, el empleado pasará al esquema anual vigente de la empresa (15 días hábiles anuales).</li>
  <li>Las vacaciones podrán solicitarse <strong class="text-foreground">a partir de los 4 meses de antigüedad</strong>.</li>
  <li>Las vacaciones podrán tomarse en el momento que cada empleado lo desee, conforme a lo establecido por la política vigente y a la planificación del equipo. Sin embargo, no se permitirá concentrar todos los días pendientes para el cierre del año, salvo que dicha programación haya sido coordinada con la empresa con la debida anticipación y cuente con la aprobación correspondiente.</li>
  <li>Las vacaciones <strong class="text-foreground">no son acumulables</strong> y deben tomarse dentro del año calendario.</li>
</ul>
<h3 class="mt-4 text-base font-semibold text-foreground">Pasantías</h3>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Los pasantes contarán con <strong class="text-foreground">10 días hábiles de estudio al año</strong>.</li>
</ul>

<h2 class="mt-6 text-lg font-bold text-foreground">2. Feriados y fechas especiales</h2>
<p>Quienes ingresen a la empresa <strong class="text-foreground">hasta antes del 01/07</strong> contarán además con:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">2 feriados argentinos a definir por equipos</strong> (Memorial Day, 4 de Julio, Labor Day, Thanksgiving, Navidad y Año Nuevo).</li>
  <li><strong class="text-foreground">Viernes Santo para todos</strong>.</li>
</ul>
<p>Es obligatorio que quienes se ausenten por estos feriados dejen sus tareas correctamente cubiertas. Los feriados que nos corresponden son los de US, sujetos a UPS.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">3. Temporadas críticas</h2>
<ul class="list-disc space-y-3 pl-5">
  <li>
    <strong class="text-foreground">Equipo Wholesale:</strong> la temporada alta suele ser:
    <ul class="list-disc space-y-1 pl-5 mt-1.5">
      <li>Segunda quincena de febrero hasta primera quincena de mayo.</li>
      <li>Segunda quincena de agosto hasta principios de diciembre.</li>
    </ul>
    <p class="mt-1.5">Durante estas fechas se espera la máxima disponibilidad operativa, teniendo presente el volumen, por lo cual la cooperación y la disponibilidad es fundamental para poder conseguir los objetivos de 5411 con nuestros clientes.</p>
    <p class="mt-1.5">En caso de tomarse vacaciones en esas fechas, coordinar previamente con el equipo, y comunicar con la mayor anticipación posible a 5411 y a los clientes que manejan. Es muy importante la comunicación y flujo de información entre quien se va de vacaciones y quienes lo van a cubrir en ese periodo.</p>
  </li>
  <li><strong class="text-foreground">Ambos equipos:</strong> no se podrán tomar vacaciones durante la semana de <strong class="text-foreground">Thanksgiving, Black Friday y Cyber Monday</strong>.</li>
</ul>

<h2 class="mt-6 text-lg font-bold text-foreground">4. Superposición de vacaciones</h2>
<p><strong class="text-foreground">No está permitida la superposición de vacaciones entre personas del mismo equipo</strong>, sin excepción. Aplica a todos los equipos: <strong class="text-foreground">E-commerce, Wholesale y áreas operativas</strong>. Cada solicitud debe garantizar la cobertura total del puesto.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">5. Duración máxima de vacaciones</h2>
<p>El máximo permitido es de <strong class="text-foreground">10 días hábiles consecutivos</strong>. Tres semanas consecutivas deberían tener una causa justa, ya que 5411 sugiere no más de dos semanas consecutivas para poder tener un balance en el descanso a lo largo del año.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">6. Validación previa obligatoria con el líder</h2>
<p>Antes de cargar cualquier solicitud en Factorial, el colaborador debe:</p>
<ol class="list-decimal space-y-2 pl-5">
  <li>
    Coordinar previamente las fechas con su líder directo.
    <ul class="list-disc space-y-1 pl-5 mt-1.5">
      <li><strong class="text-foreground">Ecommerce:</strong> Delfi</li>
      <li><strong class="text-foreground">Wholesale:</strong> Lourdes</li>
    </ul>
  </li>
  <li>
    Obtener el <strong class="text-foreground">OK del líder</strong>, validando:
    <ul class="list-disc space-y-1 pl-5 mt-1.5">
      <li>Fechas.</li>
      <li>No superposición con el equipo.</li>
      <li>Cobertura operativa.</li>
    </ul>
  </li>
</ol>
<p>No cargar vacaciones en sistema sin esta validación previa. La solicitud <strong class="text-foreground">no será aprobada si no es validada previamente con el líder</strong>.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">7. Notificación y coordinación</h2>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Las vacaciones de 4 o más días hábiles deben solicitarse con un mínimo de <strong class="text-foreground">2 meses de anticipación</strong>. Si fueran 3 días o menos, puede hacerse con un mínimo de <strong class="text-foreground">21 días de anticipación</strong>.</li>
  <li>La planificación debe realizarse de manera responsable, priorizando siempre la continuidad del equipo.</li>
</ul>

<h2 class="mt-6 text-lg font-bold text-foreground">8. Delegación de tareas (obligatoria)</h2>
<p>Previo a salir de vacaciones:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">2 semanas antes:</strong> informar a su líder y a Nacho quién tomará cada responsabilidad.</li>
  <li><strong class="text-foreground">Crear un drive compartido</strong> con procesos, tareas y responsables.</li>
  <li><strong class="text-foreground">7 días antes:</strong> reunión de traspaso con los responsables.</li>
  <li><strong class="text-foreground">Configurar respuesta automática de mail</strong> indicando a quién derivar consultas.</li>
  <li><strong class="text-foreground">Informar a la marca con la anticipación:</strong> 2 semanas de anticipación.</li>
</ul>

<h2 class="mt-6 text-lg font-bold text-foreground">9. Proceso de solicitud en Factorial</h2>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Todas las vacaciones deben solicitarse <strong class="text-foreground">exclusivamente por Factorial</strong>.</li>
  <li>La carga debe realizarse <strong class="text-foreground">solo después de contar con el OK del líder</strong>.</li>
  <li>Cada empleado podrá visualizar allí días disponibles y estado de su solicitud.</li>
</ul>`,
  },
  {
    id: "duelo",
    title: "Política de Licencia por Fallecimiento (Duelo)",
    html: `<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vigente desde: 31 de julio de 2026 · Área responsable: People / HR</p>

<h2 class="mt-4 text-lg font-bold text-foreground">1. Objetivo</h2>
<p>Establecer criterios claros y consistentes para que las personas que trabajan en 5411 puedan tomarse tiempo ante el fallecimiento de un familiar o un vínculo cercano, sin necesidad más que dar aviso, y acompañando a la persona en un momento difícil, como es la pérdida de un ser querido.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">2. Alcance</h2>
<p>Aplica a todas las personas empleadas de 5411, sin distinción de antigüedad ni tipo de contrato.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">3. Días otorgados</h2>
<p>5411 otorga como mínimo los días establecidos en promedio en diferentes países del mundo, y suma un beneficio adicional para hermanos y familia ampliada.</p>
<div class="overflow-x-auto">
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="border-b border-border text-left">
        <th class="py-2 pr-4 font-semibold text-foreground">Vínculo</th>
        <th class="py-2 pr-4 font-semibold text-foreground">Días otorgados</th>
        <th class="py-2 font-semibold text-foreground">Carácter</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-border/60">
        <td class="py-2 pr-4">Cónyuge / conviviente, hijos/as, padres/madres, hermanos/as</td>
        <td class="py-2 pr-4">3 días corridos</td>
        <td class="py-2">Pago</td>
      </tr>
      <tr>
        <td class="py-2 pr-4">Abuelos/as, tíos/as, suegros/as, cuñados/as</td>
        <td class="py-2 pr-4">1 día</td>
        <td class="py-2">Pago</td>
      </tr>
    </tbody>
  </table>
</div>
<p>Los días que finalmente se asignen son corridos (estos pueden incluir fines de semana y feriados, en caso de que caigan en esas fechas) y siempre tendrán al menos un día hábil. Los días pueden empezar a correr desde el día del fallecimiento o a partir del día del velorio/sepelio en caso de que así lo pida el empleado.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">4. Condición de pago</h2>
<p>Todos los días de esta licencia son pagos y no se descuentan de los días de vacaciones, ni de otras licencias.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">5. Procedimiento para solicitarla</h2>
<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">Avisar lo antes posible a tu líder directo</strong>, por el canal que te resulte más cómodo (mensaje, llamado, Slack).</li>
  <li>Tu líder o HR, o vos mismo, cargan la licencia en Factorial una vez que estás de vuelta o cuando puedas hacerlo — no hace falta gestionarlo vos en el momento.</li>
  <li>Si necesitás más días de los establecidos (por ejemplo, trámites sucesorios, distancia geográfica, u otras circunstancias), podés conversarlo con tu líder y HR para evaluar la posibilidad de días extras.</li>
</ul>

<h2 class="mt-6 text-lg font-bold text-foreground">6. Continuidad operativa</h2>
<p>Tu líder es responsable de coordinar, junto al equipo, la cobertura de tareas urgentes durante tu ausencia. No se espera que la persona en duelo deje resuelto su trabajo antes de ausentarse.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">7. Confidencialidad y acompañamiento</h2>
<p>La información sobre la situación personal se maneja con discreción. Líderes y HR están disponibles para conversar sobre flexibilidad adicional (horarios reducidos, trabajo remoto transitorio, etc.) al regreso, si la persona lo necesita.</p>

<h2 class="mt-6 text-lg font-bold text-foreground">8. Revisión</h2>
<p>Esta política será revisada por HR periódicamente y podrá actualizarse a medida que 5411 crezca.</p>`,
  },
  {
    id: "rendicion-gastos",
    title: "Rendición de gastos personales",
    html: `<p>Desde este link podrás presentar gastos de estacionamiento, comida y asociado a cuestiones laborales.</p>
<p>Se tomarán rendiciones hasta <strong class="text-foreground">último día hábil de la semana a las 15 hs</strong>.</p>
<a href="https://docs.google.com/forms/d/e/1FAIpQLSeiFZlDSVOrR6RgbNVzu90SNtCrZrMbqPRy0lx2poTT3oNa9A/viewform?vc=0&c=0&w=1&flr=0" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
  Ir al formulario de rendición →
</a>`,
  },
  {
    id: "feriados",
    title: "Feriados",
    html: `<p>Los feriados son acordes a los feriados de UPS. Además, se otorgan 2 feriados argentinos a cada empleado, distribuidos equitativamente para seguir manteniendo el funcionamiento de la empresa.</p>

<div class="space-y-4">
  <div>
    <p class="font-semibold text-foreground">1 de enero — Año Nuevo</p>
    <p>El Día de Año Nuevo fue aprobado por el Congreso como feriado en 1870 y se celebra con tradiciones icónicas como el descenso de la bola de cristal en Times Square, Nueva York.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">3 de abril — Viernes Santo</p>
    <p>Feriado argentino, otorgado para toda la empresa.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">25 de mayo — Día de los Caídos (Memorial Day)</p>
    <p>Se celebra el último lunes de mayo para honrar a los soldados que perdieron la vida en servicio. Son comunes tradiciones como el minuto de silencio a las 15 horas.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">4 de julio — Día de la Independencia</p>
    <p>Se celebra la declaración de independencia de 1776 con desfiles, fuegos artificiales y actividades patrióticas.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">7 de septiembre — Día del Trabajo (Labor Day)</p>
    <p>Rinde homenaje a los trabajadores y al movimiento laboral.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">26 de noviembre — Día de Acción de Gracias (Thanksgiving)</p>
    <p>Se celebra con cenas familiares y tradiciones como el desfile de Macy's en Nueva York.</p>
  </div>
  <div>
    <p class="font-semibold text-foreground">25 de diciembre — Navidad</p>
    <p>Se dedica a celebrar una de las festividades más significativas del año, tanto en lo religioso como en lo cultural.</p>
  </div>
</div>`,
  },
  {
    id: "almuerzos-y-planes",
    title: "Almuerzos y planes",
    html: `<p>Hay un canal en Slack llamado <strong class="text-foreground">#almuerzos-y-planes</strong>.</p>
<p>Es el canal para organizarnos con algo que nos encanta: <strong class="text-foreground">la comida y los planes</strong> 🍕🍻.</p>
<p>Ahí:</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Armamos la lista de <strong class="text-foreground">qué almorzamos</strong> en el cowork: Marin siempre manda qué vamos a comer, y a partir de esa lista la idea es sumarse con lo que querés comer.</li>
  <li>Podés compartir ideas de afters o juntadas.</li>
  <li>Compartir recomendaciones, antojos o lugares nuevos.</li>
</ul>
<p>En la descripción de ese canal están los menús fijos que tenemos. Generalmente comemos <strong class="text-foreground">DeliAli</strong> y <strong class="text-foreground">Artesano</strong>.</p>`,
  },
  {
    id: "reuniones-presenciales-cowork",
    title: "Reuniones presenciales / Cowork",
    html: `<ul class="list-disc space-y-1.5 pl-5">
  <li><strong class="text-foreground">Reunión semanal de equipo:</strong> sincronización de proyectos y prioridades.</li>
</ul>`,
  },
  {
    id: "home-office",
    title: "Home Office",
    html: `<p>El trabajo remoto es una modalidad ocasional y sujeta a aprobación previa, destinada a trabajar fuera de Buenos Aires. Se considera "fuera de Buenos Aires" a todo lugar ubicado a más de 100 km de la Ciudad de Buenos Aires. En Factorial debe estar aclarado sin excepción el lugar desde el cual estarán trabajando.</p>
<p>Esta obligación de carga en Factorial rige siempre, <strong class="text-foreground">independientemente</strong> de si ese día hay o no presencialidad fija en la oficina. Ya sea un jueves (día de oficina establecido) o un viernes (día sin oficina fija), si el colaborador va a trabajar desde un lugar a más de 100 km de Buenos Aires —campo, otra provincia, etc.—, debe solicitarlo y registrarlo como día remoto en Factorial. El hecho de que un día no tenga obligación de presencialidad no exime de este registro: toda jornada de home office fuera de ese radio, sin importar el día de la semana, debe quedar cargada en el sistema.</p>
<p><strong class="text-foreground">Para nuevos integrantes:</strong> tendrán acceso a 20 días hábiles, que se habilitarán pasados los primeros 4 meses laborales, para utilizar durante todo el año. Podrán usarse gradualmente, con el límite de que el primer pedido no puede exceder 5 días hábiles.</p>
<p><strong class="text-foreground">Para empleados actuales:</strong> tendrán acceso a 4 semanas, con la posibilidad de solicitar 4 semanas más (sujeto a desempeño del empleado y con previa confirmación de Sofi y Martín).</p>
<ul class="list-disc space-y-1.5 pl-5">
  <li>Las solicitudes tendrán límites de tiempo definidos y quedan sujetas a aprobación según el caso. La aprobación dependerá de la función, el desempeño y la viabilidad operativa. Debe mantenerse el estándar de productividad y disponibilidad. Toda solicitud deberá pedirse con una anticipación de 3 semanas, confirmando el destino donde se va a realizar el trabajo remoto.</li>
</ul>`,
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
      {
        id: "empresa.politicas",
        label: "Políticas y beneficios",
        icon: FileText,
        view: "doc",
        layout: "accordion",
        sections: POLITICAS_SECTIONS,
      },
      {
        id: "empresa.setup-dia-1",
        label: "Setup día 1",
        icon: ListChecks,
        view: "doc",
        layout: "accordion",
        sections: SETUP_DIA_1_SECTIONS,
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
