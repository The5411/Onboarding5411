import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logisticsFlowAsset from "@/assets/proceso5411.png";
import DependeMarca from "@/assets/DependeMarca.png";
import mapa from "@/assets/Mapa.png";
import hero from "@/assets/Comunicacion.png";
import slackConfirmaLlegadaAsset from "@/assets/Slack.png";
import racks from "@/assets/racks.png";
import cajaArmada from "@/assets/cajaArmada.png";
import pedirAprobacion from "@/assets/Autorizacion.png";
import warehouseVideo from "@/assets/WarehouseVideo.mp4";
import ordenEjemplo from "@/assets/orden.png";
import grupoReturns from "@/assets/GrupoReturn.png";
import cajaPosta from "@/assets/CajaPosta.jpeg";
import {
  ClipboardList,
  Warehouse,
  Users,
  Inbox,
  Link2,
  ListChecks,
  FileText,
  PackageCheck,
  AlertTriangle,
  Boxes,
  Truck,
  ScanLine,
  PackageOpen,
  ClipboardCheck,
  Forklift,
  Play,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Onboarding 5411 — Guía Interactiva Logística" },
      {
        name: "description",
        content:
          "Guía interactiva del proceso operativo logístico 5411: inbound, outbound, shipping y returns paso a paso.",
      },
      { property: "og:title", content: "Onboarding 5411 — Guía Interactiva" },
      {
        property: "og:description",
        content:
          "Explorá el proceso 5411 fase por fase: roadmap, diagramas, responsables y documentación.",
      },
    ],
  }),
  component: Index,
});

// Definición de tipos para soportar acciones multimedia específicas
type ActionType = "asn" | "box" | "labels" | "tracker" | "compare_tracking" | "recepcion_ordenes" | "cargar_orden_mintsoft" | "mandar_a_armar_orden" | "caja_armada_ejemplo" | "explicacion_ups_tracker" | "ejemplo_autorizacion" | "crossDockGuide" | "returns_video" | "returns_slack" | "cajaLista";

type Stage = {
  id: string;
  number: number;
  name: string;
  short: string;
  objective: string;
  responsible: string;
  inputs: string[];
  activities: {
    title: string;
    detail?: string;
    blocks?: { type: "text" | "button"; content?: string; action?: ActionType }[];
    items?: string[];
  }[];
  docs: string[];
  outputs: string[];
  dependencies: string[];
  warehouse: string;
  critical?: string[];
  phaseColor?: string;
  phaseVar: string;
};

// Configuración centralizada de recursos multimedia para evitar lógica dura repetitiva
const MEDIA_RESOURCES: Record<string, { title: string; type: "video" | "audio" | "image"; src: string }> = {
  asn: { title: "Cómo crear un ASN", type: "video", src: "https://www.youtube.com/embed/y7goZ96k0eY?autoplay=1&rel=0" },
  box: { title: "Cómo crear una caja", type: "video", src: "https://www.youtube.com/embed/doRO4KPgpFo?autoplay=1&rel=0" },
  tracker: { title: "Explicación de Tracker", type: "video", src: "https://www.youtube.com/embed/4yXZkSGDvDs" },
  labels: { title: "Cómo Enviar labels", type: "video", src: "https://www.youtube.com/embed/Ox7jbakLZK8" },
  compare_tracking: { title: "ASN REPORT", type: "video", src: "https://www.youtube.com/embed/HiEPR1qTa6E" }, 
  warehouse_camilo: { title: "Video del Warehouse - Camilo", type: "video", src: "https://www.youtube.com/embed/0MqtGJ3c_pY" },
  ari_returns: { title: "Video del Warehouse - Ari", type: "video", src: "https://www.youtube.com/embed/pfeDuQki4rA" },
  two_boxes: { title: "Video del Warehouse - Two Boxes", type: "video", src: "https://www.youtube.com/embed/XWj_OOqt8-s" },
  audio_camilo: { title: "Perspectiva de Camilo - Audio", type: "video", src: "https://www.youtube.com/embed/89CBuovfewA" },
  audio_samuel: { title: "Perspectiva de Samuel - Audio", type: "video", src: "https://www.youtube.com/embed/xeYgRup3cC4" },
  audio_nai: { title: "Perspectiva de Nai - Audio", type: "video", src: "https://www.youtube.com/embed/t3X5y8-8F9Q" },
  audio_karen: { title: "Perspectiva de Karen - Audio", type: "video", src: "https://www.youtube.com/embed/FyfDM4Bkalc" },
  samuel_inbound: { title: "Video de Samuel", type: "video", src: "https://www.youtube.com/embed/tIrZr1NjnKM" },
  generic_warehouse: { title: "Video del Warehouse", type: "video", src: "https://www.youtube.com/embed/eJvWNrbTwZc?autoplay=1&rel=0" },
  recepcion_ordenes: {
    title: "Recepción de órdenes",
    type: "image",
    src: ordenEjemplo
  },

  cargar_orden_mintsoft: {
    title: "Cómo cargar una orden",
    type: "video",
    src: "https://www.youtube.com/embed/gQlhAAuWubI"
  },
  mandar_a_armar_orden: {
    title: "Cómo mandar a armar una orden",
    type: "video",
    src: "https://www.youtube.com/embed/g4vjzUgvAqs"
  },
  caja_armada_ejemplo: {
    title: "Ejemplo",
    type: "image",
    src: cajaArmada,
  },
  cajaLista: { //estan inversas
    title: "Ejemplo",
    type: "image",
    src: cajaPosta,
  },

  explicacion_ups_tracker: {
    title: "Explicación UPS y Tracker",
    type: "video",
    src: "URL_DEL_VIDEO_O_GUIA"
  },
  ejemplo_autorizacion: {
    title: "Ejemplo de autorización",
    type: "image",
    src: pedirAprobacion
  },
  Video_operativo_outbound: {
    title: "Video_operativo_outbound",
    type: "video",
    src: "https://www.youtube.com/embed/5ZhUPymlAzc" // Video operativo outbound
  },
  Armar_Caja: {
    title: "Armar_Caja",
    type: "video",
    src: "https://www.youtube.com/embed/FxI_5ndlJ_k" // Video operativo outbound
  },
  Armar_Caja_Boutique: {
    title: "Armar_Caja_Boutique",
    type: "video",
    src: "https://www.youtube.com/embed/Nn03MGUuBvY" // Video operativo outbound
  },
  crossDockGuide: {
    title: "Guía de Cross Dock",
    type: "video",
    src: "https://app.notion.com/p/Armado-de-Ordenes-3183d576fa0280848566d0081bb6b3cc",
  },
  returns_video: {
    title: "Returns Video",
    type: "video",
    src: "https://www.youtube.com/",//para un futuro si alguien quiere mostrar un return en vivo
  },
  returns_slack: {
    title: "Returns Slack Group",
    type: "image",
    src: grupoReturns, 
  },
};

const STAGES: Stage[] = [
  {
    id: "inbound",
    number: 1,
    name: "Inbound",
    short: "Entrada de mercadería al warehouse",
    objective:
      "El cliente avisa que viene mercadería en camino y se prepara el sistema para recibirla correctamente en el warehouse.",
    responsible: "Equipo BS AS / Operaciones",
    inputs: ["Mail del cliente con Tracking", "Excel o PDF con Packing List"],
    activities: [
      {
        title: "1. Recepción del Packing List",
        blocks: [
          { type: "text", content: "La marca envía mail con tracking # + Packing List." },
          { type: "text", content: " Con este documento creamos el ASN = significa Advanced Shipping Notice (Aviso de Envío Anticipado) " },
          { type: "button", action: "asn", content: "Como crear un ASN" },
          { type: "text", content: "Y también creamos las CAJAS en Mintsoft. Para que el warehouse sepa cuantas cajas hay en el cargamento." },
          { type: "button", action: "box", content: "Como crear una caja" },
          { type: "text", content: "Lo ideal es cargarlo antes de que la mercadería llegue al warehouse para avisarle al sistema y al equipo de Dallas que hay un cargamento próximo a llegar." }
        ]
      },
      {
        title: "2. Tracker de la marca",
        detail: "Cada marca tiene su tracker donde ponemos la información de las órdenes y los cargamentos. Una vez generado el ASN debemos anotarlo en la hoja de cargamentos (ASN# +tracking, unidades, caja y ETA).",
        blocks: [{ type: "button", action: "tracker", content: "Explicación de Tracker" }],
      },
      {
        title: "3. Cargamento",
        blocks: [
          {
            type: "text",
            content: "Una vez que se recibe la foto de Camilo por el grupo, anotamos  el numero de tracking and hacemos el envío de las carton labes (email INBOUND con el nombre de la marca, el número de cargamento y carton labels). Si hay cajas faltantes esperar a que llegue el restante y hablar con la marca si hace falta."
          },
          {
            type: "button",
            action: "labels",
            content: "Como Enviar labels"
          }
        ]
      },
      {
        title: "4. Validation Tracking vs ASN -  Respuesta a la marca",
        detail: "Se compara las unidades  fisicas contra el ASN cargado en sistema.  Una vez que finaliza el escaneo, se le envía a la marca el ASN REPORT.",
        blocks: [{ type: "button", action: "compare_tracking", content: "ASN REPORT" }],
      },
    ],
    docs: ["Packing List", "ASN Template", "Tracker de la marca"],
    outputs: ["ASN cargado en Mintsoft", "Tracker actualizado"],
    dependencies: ["Aviso previo del cliente"],
    warehouse:
      "1. Camilo recepciona la mercadería y sube las fotos de los cargamentos a Slack al grupo de la marca.",
    critical: [
      "Verificar que el ASN se esté generando para el cliente correcto. Siempre filtrar al cliente antes de empezar a cargar.",
      "Si un producto no está creado, incluir sus códigos de barras (barcodes) al cargar el ASN.",
      "Confirmar que el ASN se encuentre en estado 'AWAITING DELIVERY'; de lo contrario, Samuel no podrá visualizarlo.",
      "Al crear las cajas, seleccionar siempre la opción 'RS Transit'."
    ],
    phaseVar: "--phase-1",
  },
  {
    id: "outbound",
    number: 2,
    name: "Outbound",
    short: "Preparación de órdenes de salida",
    objective:
      "Procesar los pedidos que van a salir del warehouse hacia boutiques o majors. Una orden es un pedido de productos a preparar y enviar.",
    responsible: "Equipo BS AS",
    inputs: ["Órdenes recibidas por mail", "Stock validado"],
    activities: [
      {
        title: "Proceso de recepción y preparación de órdenes",
        blocks: [
          {
            type: "text",
            content: "Las órdenes pueden recibirse por distintas vías según la modalidad de trabajo con cada marca."
          },
          {
            type: "text",
            content: "• Por correo electrónico."
          },
          {
            type: "text",
            content: "• Incluidas dentro de la información enviada al momento de asignar el cargamento."
          },
          {
            type: "text",
            content: "• Buscándolas directamente en la plataforma utilizada por la marca."
          },
          {
            type: "text",
            content: "• Migradas desde otras plataformas o sistemas integrados (por ejemplo Shipstation) la marca o sistemas externos conectados."
          },
          {
            type: "text",
            content: "Una vez recibidas, todas las órdenes deben ingresarse en el Tracker para realizar su seguimiento operativo."
          },
          {
            type: "button",
            action: "recepcion_ordenes",
            content: "Ejemplo de recepción de órdenes"
          },
          {
            type: "text",
            content: "Las órdenes se clasifican según su tipo:"
          },
          {
            type: "text",
            content: "• Major"
          },
          {
            type: "text",
            content: "• Boutique"
          },
          {
            type: "text",
            content: "Luego se define la modalidad operativa:"
          },
          {
            type: "text",
            content: "• Cross Dock: ingreso y despacho inmediato de la mercadería."
          },
          {
            type: "button",
            action: "crossDockGuide",
            content: "Ver Guía de Cross Dock"
          },
          {
            type: "text",
            content: "• Pick & Pack: preparación de pedidos a partir de la mercadería recibida."
          },
          {
            type: "text",
            content: "SE CARGAN LAS ORDENES EN MINTSOFT"
          },
          {
            type: "button",
            action: "cargar_orden_mintsoft",
            content: "Cómo cargar una orden"
          }
        ]
        
      },
      {
        title: "Mandar a armar las órdenes",
        blocks: [
          {
            type: "text",
            content: 'Mandar a armar una orden significa solicitar al warehouse que prepare el pedido recibido por parte de la marca. Hay que cargar la orden en Mintsoft utilizando un template llamado <a href="https://docs.google.com/spreadsheets/d/1tTvWVIygN5TXWkee9eNk9JFZB5tOBS3A90u_HqixFUc/edit?gid=896359184#gid=896359184" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">SO Mintsoft - 5411 - Subir ordenes</a>. Una vez finalizado el armado, el warehouse enviará una fotografía donde se visualizan las medidas de la caja.'
          },
          {
            type: "text",
            content:
              "El proceso de pickeo de las órdenes es exactamente el mismo en ambos casos. La principal diferencia se encuentra en la etapa previa al packing, ya que la preparación de los productos antes de su empaquetado cambia de manera significativa según el tipo de orden."
          },
          {
            type: "button",
            action: "mandar_a_armar_orden",
            content: "Cómo mandar a armar una orden"
          }
        ]
      },
      {
        title: "Sacar órdenes",
        blocks: [
          {
            type: "text",
            content:
              "Una vez que una orden se encuentra en estado <strong>PACKED</strong>, significa que el pedido ya fue procesado por el warehouse (pickeo y packeo) y está listo para ser despachado."
          },
          {
            type: "button",
            action: "cajaLista",
            content: "Caja armada - Ejemplo"
          },
          {
            type: "button",
            action: "caja_armada_ejemplo",
            content: "Orden armada - Ejemplo"
          },
          {
            type: "text",
            content:
              "<strong>Órdenes de Boutique con 1 sola caja</strong>"
          },
          {
            type: "text",
            content:
              "• Si la orden está aprobada para salir, el warehouse (Nairobis) se encarga de generar la etiqueta (label) de UPS."
          },
          {
            type: "text",
            content:
              "• Si la orden no está aprobada para salir, el warehouse (Nairobis) deja la caja preparada e identificada con un sticker rojo, quedando en espera hasta recibir la autorización de despacho."
          },
          {
            type: "text",
            content:
              "<strong>Importante:</strong> Al cargar la orden en Mintsoft se debe indicar esta condición (<strong>No aprobada para salir</strong>) en el campo <strong>Packing Notes</strong>."
          },

          {
            type: "text",
            content:
              "<strong>Órdenes de Major con 1 sola caja</strong>"
          },
          {
            type: "text",
            content:
              "• Si la orden está aprobada para salir, el warehouse (Karen / Aida) genera la etiqueta (label) de UPS e imprime toda la documentación cargada en Mintsoft (Packing List, Carton Labels, etc.)."
          },
          {
            type: "text",
            content:
              "• Si la orden no está aprobada para salir, el warehouse (Karen / Aida) deja la caja preparada e identificada con un sticker rojo, quedando en espera hasta recibir la autorización de despacho."
          },
          {
            type: "text",
            content:
              "<strong>Importante:</strong> Al cargar la orden en Mintsoft se debe indicar esta condición (<strong>No aprobada para salir</strong>) en el campo <strong>Packing Notes</strong>."
          },

          {
            type: "text",
            content:
              "<strong>Órdenes Boutique / Major con más de 1 caja</strong>"
          },
          {
            type: "text",
            content:
              "• Si cuentan con la aprobación para salir, nosotros generamos las etiquetas de UPS junto con la documentación requerida por el Major y enviamos todo al warehouse por correo electrónico con el asunto <strong>'PARA SALIR'</strong>, para que procedan con el despacho."
          },
          {
            type: "text",
            content:
              "Hay órdenes de Majors que requieren una aprobación previa antes de ser despachadas. Este proceso se denomina ruteo y puede realizarse por correo electrónico o a través de un portal específico. En ambos casos, es importante dejar constancia de la solicitud de aprobación en el Tracker. "
          },
          {
            type: "button",
            action: "ejemplo_autorizacion",
            content: "Autorización - Ver ejemplo"
          },
          {
            type: "text",
            content:
              "Una vez despachada la orden, se debe registrar el Tracking Number en el Tracker y actualizar el estado de la orden para reflejar que el envío ya fue realizado."
          }
        ]
      }
    ],
    docs: ["Packing list de outbound", "Mail con orden original"],
    outputs: ["Órdenes clasificadas y listas para cargar"],
    dependencies: ["Stock disponible (Gestión de Stock)"],
    warehouse:
      "1. El warehouse entiende qué órdenes preparar, qué productos buscar y si deben rearmar cajas o despachar directo.", 
    critical: ["Actualmente estamos atravesando un proceso de cambios operativos, por lo que esta información podrá actualizarse y modificarse en adelante."],
    phaseVar: "--phase-4",
  },
  {
    id: "shipping",
    number: 3,
    name: "Returns",
    short: "Devoluciones",
    objective:
      "Gestionar las devoluciones de nuestros clientes",
    responsible: "Equipo BS AS",
    inputs: ["Pedidos armados y etiquetados"],
    activities: [
      {
        title: " RETURNS",
        detail: "En algunos casos, una marca puede solicitar que generes una return label para su cliente. Cuando esto sucede, deberás crearla manualmente en UPS. Para hacerlo, es importante contar con la siguiente información:",
        blocks:[
          {
            type: "text",
            content:
              '<div style="margin-top: 14px; margin-bottom: 8px;">• Datos completos del remitente (quien envía el paquete).</div>'
          },
          {
            type: "text",
            content:
              " • Peso de cada caja y medidas de la caja."
          },
          {
            type: "text",
            content:
              "En el campo Reference, siempre se debe ingresar el nombre de la marca + Return (por ejemplo: BrandName - Return). Esto facilita la identificación del envío cuando llega al warehouse."
          },
          {
            type: "text",
            content:
              "También puede pasar que la return label la genere la marca y te avise/ o no que está volviendo mercadería."
          },
          {
            type: "text",
            content:
              "Es importante estar en el grupo de slack #returns- wholesale, ya que allí las chicas van anotando que se proceso o que necesita revision de tu parte"
          },
          {
            type: "button",
            action: "returns_slack",
            content: "Grupo de Slack Returns - Ejemplo"
          },
        ]
      },
    ],
    docs: ["UPS Labels", "Commercial Invoice", "BOL Documents", "Return Labels"],
    outputs: ["Pedido despachado / Retorno reingresado"],
    dependencies: ["Batches y Preparación"],
    warehouse:
      "El warehouse recibe diariamente un gran volumen de returns, tanto de Wholesale como de Ecommerce. Al día siguiente de su recepción, el equipo del warehouse comienza a clasificar los paquetes por marca para dar inicio al proceso de trabajo correspondiente.",
    phaseVar: "--phase-8",
  },
];

const CONTROL_ARRIBO_STAGE = STAGES.find((stage) => stage.id === "control-arribo");

const FAQS = [
  {
    q: "¿Qué es un ASN?",
    a: "Advance Shipping Notice — aviso anticipado cargado en Mintsoft con el detalle de la mercadería que va a llegar. Se carga 1 ASN por cada PO.",
  },
  {
    q: "¿Cuál es el formato del código de un Carton?",
    a: "PRIMERAS DOS LETRAS + últimos 6 dígitos del tracking + número de caja. Ejemplo: MO-468889-1.",
  },
  {
    q: "¿Cuándo envío las carton labels al warehouse?",
    a: "Recién cuando confirman por Slack que llegaron las cajas físicamente.",
  },
  {
    q: "¿Cuál es la diferencia entre Cross Dock y Pick & Pack?",
    a: "Cross Dock: la caja entra y sale rápido sin almacenarse. Pick & Pack: el warehouse abre cajas, busca productos y arma nuevas cajas.",
  },
  {
    q: "¿Qué hago si una orden queda en ONBACKORDER?",
    a: "El stock existe pero no está ubicado correctamente. Es posible que el stock correspondiente a la orden aún no llegó o no se procesó.",
  },
  {
    q: "Cuáles son los estados de una orden?",
    a: "Tracker: Entered → Packing → Packed → Routed Shipped. / Mintsoft: New  →  Awaiting picking  → Picked → Packed → Despatched o Invoice",
    
  },
  {
    q: "¿Cuál es el cutoff de pickup?",
    a: "4:00 PM. El warehouse cierra a las 5:00 PM. Si no está listo antes del cutoff, queda retenido para el día siguiente.",
  },
];

function Index() {
  const [active, setActive] = useState<string>(STAGES[0].id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, true])),
  );
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Estado único para controlar la apertura de cualquier contenido multimedia dinámico
  const [activeMediaKey, setActiveMediaKey] = useState<string | null>(null);

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
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return STAGES;
    const q = query.toLowerCase();
    return STAGES.filter((s) => JSON.stringify(s).toLowerCase().includes(q));
  }, [query]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeIndex = STAGES.findIndex((s) => s.id === active);
  const progress = ((activeIndex + 1) / STAGES.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--gradient-hero)" }}
        />
      </div>

      {/* Hero */}
      {/* Hero con Video de Fondo */}
      <header className="relative overflow-hidden border-b border-border min-h-[500px]">
        {/* 1. La etiqueta de video posicionada por detrás */}
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

        {/* 2. La capa de gradiente (ahora va como un div absoluto encima del video y debajo del texto) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, oklch(0.97 0.015 240 / 0.85) 35%, oklch(0.97 0.015 240 / 0.3) 100%)`
          }}
        />

        {/* Capa de ruido o gradiente extra radial opcional */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.6 0.2 270 / 0.05), transparent 50%)",
          }}
        />

        {/* 3. El contenido del texto principal (importante el z-20 para que quede arriba de todo) */}
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--phase-4)" }} />
            Proceso Operativo Logístico
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
            Guía interactiva de principio a fin: desde el aviso del cliente hasta el despacho y las
            devoluciones.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo(STAGES[0].id)}
              className="rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
              style={{ background: "var(--gradient-hero)" }}
            >
              Empezar el recorrido →
            </button>
            <a
              href="#faq"
              className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Ver FAQ
            </a>
          </div>

          {/* Pastillas de las fases (Inbound, Outbound, etc.) */}
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8"
            style={{ marginTop: "6rem" }}
          >
            {STAGES.filter((s) => s.id !== "control-arribo").map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="group rounded-xl border border-border bg-card/90 backdrop-blur-sm p-3 text-left transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: `var(${s.phaseVar})` }}
                >
                  {s.number}
                </div>
                <div className="text-xs font-semibold leading-tight">{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

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
                href="#horarios"
                className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary"
              >
                Horarios
              </a>
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
              {STAGES.map((s, i) => (
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
                  {i < STAGES.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Stages */}
          <div className="space-y-12">
            {filtered.filter((s) => s.id !== "control-arribo").map((s) => {
              const isOpen = expanded[s.id] ?? true;
              return (
                <section
                  key={s.id}
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
                      <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))}
                        className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/30"
                      >
                        {isOpen ? "Contraer −" : "Expandir +"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <StageBody
                      stage={s}
                      onTriggerMedia={(key) => setActiveMediaKey(key)}
                    />
                  )}
                </section>
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
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
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

      {/* Único modal dinámico e independiente para audios y videos */}
      <MediaModal resourceKey={activeMediaKey} onClose={() => setActiveMediaKey(null)} />
    </div>
  );
}

const WAREHOUSE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  inbound: Truck,
  cartons: PackageOpen,
  "control-arribo": ScanLine,
  outbound: ClipboardCheck,
  "ordenes-mintsoft": ListChecks,
  stock: Boxes,
  batches: Forklift,
  shipping: PackageCheck,
};

function StageBody({
  stage: s,
  onTriggerMedia,
}: {
  stage: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Objective banner — common to both areas */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Objetivo de la etapa
        </div>
        <p className="mt-2 text-base leading-relaxed">{s.objective}</p>
      </div>

      {/* Two perspectives: Admin vs Warehouse */}
      {s.id === "inbound" && (
        <div
          className="rounded-3xl border-2 p-4 md:p-5"
          style={{
            borderColor: "oklch(0.75 0.08 200 / 0.45)",
            background:
              "linear-gradient(180deg, oklch(0.98 0.015 200) 0%, oklch(1 0 0) 100%)",
          }}
        >
          <div
            className="mb-4 flex items-center gap-2 border-b pb-3"
            style={{ borderColor: "oklch(0.75 0.08 200 / 0.35)" }}
          >
            <ClipboardList
              className="h-5 w-5"
              style={{ color: "oklch(0.45 0.13 200)" }}
            />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Proceso
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <StageAdminColumn s={s} onTriggerMedia={onTriggerMedia} />
            <StageWarehouseColumn s={s} onTriggerMedia={onTriggerMedia} />
          </div>
        </div>
      )}

      {s.id === "inbound" && CONTROL_ARRIBO_STAGE && (
        <div
          id="control-arribo"
          className="rounded-3xl border-2 p-4 md:p-5"
          style={{
            borderColor: "oklch(0.58 0.08 140 / 0.45)",
            background:
              "linear-gradient(180deg, oklch(0.96 0.04 120) 0%, oklch(0.99 0.02 120) 100%)",
          }}
        >
          <div
            className="mb-4 flex items-center gap-2 border-b pb-3"
            style={{ borderColor: "oklch(0.58 0.08 140 / 0.35)" }}
          >
            <ScanLine className="h-5 w-5" style={{ color: "oklch(0.45 0.12 140)" }} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Proceso
              </div>
              <h3 className="text-base font-bold" style={{ color: "oklch(0.35 0.12 140)" }}>
                Control de Arribo
              </h3>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <StageAdminColumn s={CONTROL_ARRIBO_STAGE} onTriggerMedia={onTriggerMedia} />
            <StageWarehouseColumn s={CONTROL_ARRIBO_STAGE} onTriggerMedia={onTriggerMedia} />
          </div>
        </div>
      )}

      {s.id !== "inbound" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <StageAdminColumn s={s} onTriggerMedia={onTriggerMedia} />
          <StageWarehouseColumn s={s} onTriggerMedia={onTriggerMedia} />
        </div>
      )}
    </div>
  );
}

function StageAdminColumn({
  s,
  onTriggerMedia,
}: {
  s: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  const adminIconBg = s.phaseColor === "green" ? "oklch(0.45 0.12 140)" : "var(--gradient-hero)";
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
          style={{ background: adminIconBg }}
        >
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Perspectiva
          </div>
          <h3 className="text-lg font-bold">Administración</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Responsable */}
        <div className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Responsable
            </div>
            <div className="text-sm font-medium">{s.responsible}</div>
          </div>
        </div>

        

        {/* Actividades */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-4 w-4" /> Actividades administrativas
          </div>
          <div className="space-y-2">
            {s.activities.map((a, i) => (
              <Activity key={i} activity={a} phaseVar={s.phaseVar} onTriggerMedia={onTriggerMedia} />
            ))}
          </div>
        </div>

        {/* Críticos */}
        {s.critical && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">
              <AlertTriangle className="h-4 w-4" /> Puntos críticos / Validaciones
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {s.critical.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StageWarehouseColumn({
  s,
  onTriggerMedia,
}: {
  s: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  const WhIcon = WAREHOUSE_ICONS[s.id] ?? Warehouse;
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null);

  const warehouseAccent = s.phaseColor === "green" ? {
    border: "oklch(0.58 0.08 140 / 0.3)",
    background: "linear-gradient(180deg, oklch(0.96 0.04 120) 0%, var(--card) 100%)",
    icon: "linear-gradient(135deg, oklch(0.45 0.12 140), oklch(0.38 0.12 140))",
    label: "oklch(0.35 0.12 140)",
    badge: "oklch(0.95 0.04 120)",
    badgeText: "white",
  } : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6"
      style={{
        borderColor: warehouseAccent?.border ?? `oklch(from var(${s.phaseVar}) l c h / 0.3)`,
        background: warehouseAccent?.background ?? `linear-gradient(180deg, oklch(from var(${s.phaseVar}) 0.97 0.02 h) 0%, var(--card) 100%)`,
      }}
    >
      <WhIcon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-[0.07]" />

      <div
        className="mb-5 flex items-center gap-3 border-b pb-4"
        style={{ borderColor: warehouseAccent?.border ?? `oklch(from var(${s.phaseVar}) l c h / 0.2)` }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
          style={{
            background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
          }}
        >
          <Warehouse className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Perspectiva
          </div>
          <h3 className="text-lg font-bold">Warehouse</h3>
        </div>
      </div>

      <div className="relative space-y-5">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-md">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
            }}
          >
            <WhIcon className="h-8 w-8" />
          </div>

          <div
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: warehouseAccent?.label ?? `var(${s.phaseVar})` }}
          >
            Qué pasa físicamente
          </div>

             {s.id === "inbound" && ( //WAREHOUSE ETAPA INBOUND EDITAR ACA
            <div className="w-full mt-3 space-y-4">
              <div className="py-2 text-center text-xl font-extrabold text-blue-600">
                Etapa Camilo
              </div>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">{s.warehouse}</p>
              {/* Video Camilo */}
              <button
                type="button"
                onClick={() => onTriggerMedia("warehouse_camilo")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    warehouseAccent?.icon ??
                    `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Video del Warehouse
              </button>

              {/* Ejemplo Slack */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Ejemplo
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImageModal({
                      src: slackConfirmaLlegadaAsset,
                      alt: "Ejemplo de confirmación en Slack",
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ScanLine className="h-4 w-4 text-primary" />
                  Ver foto de Slack
                </button>
              </div>

              {/* Audio Camilo Independiente */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Audio de Camilo explicando el proceso
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerMedia("audio_camilo")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    🎤
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      Perspectiva de Camilo
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PUNTO CRITICO/ VALIDACIONES
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    ▶ Audio
                  </span>
                </button>
              </div>

              <div className="my-2 border-t border-border" />

              {/* Samuel Section */}
              <div className="pt-2 text-center text-xl font-extrabold text-green-600">
                Etapa Samuel
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">
                2. De acuerdo con las prioridades, Samuel retira las cajas de RS y las lleva a su mesa de trabajo. Luego imprime las etiquetas (labels), organiza las cajas en el orden correspondiente, coloca las etiquetas y comienza el proceso de escaneo.
              </div>

              {/* Video Samuel Independiente con Estilo Solicitado */}
              <button
                type="button"
                onClick={() => onTriggerMedia("samuel_inbound")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                Video de Samuel
              </button>
              {/* Audio Samuel Independiente */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Audio de Samuel explicando el proceso
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerMedia("audio_samuel")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    🎤
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      Perspectiva de Samuel
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PUNTO CRITICO/ VALIDACIONES
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    ▶ Audio
                  </span>
                </button>
              </div>
              
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">
                3. Luego de que Samuel termina de escanear la mercadería se agrupa en RS TRANSIT para luego darse locación en su correspondiente Rack/ bin.
              </div>

              <button
                type="button"
                onClick={() =>
                  setImageModal({
                    src: racks,
                    alt: "Ejemplo de confirmación en Slack",
                  })
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
              >
                <ScanLine className="h-4 w-4 text-primary" />
                PLANO DEL WAREHOUSE DE LOS RACKS
              </button>
            </div>
          )}
          {s.id === "outbound" && ( //ACA EDITAR OUTBOUND WAREHOUSE
            <div className="w-full mt-3 space-y-4">
              <div className="py-2 text-center text-xl font-extrabold text-green-600">
                Etapa armado de ordenes
              </div>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">{s.warehouse}</p>
              {/* Ejemplo: Si querés disparar un video o audio de esta etapa */}
              <button
                type="button"
                onClick={() => onTriggerMedia("Video_operativo_outbound")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Ver Video  - Armar la orden
              </button>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">2. El warehouse empieza a armar la caja</p>
              <button
                type="button"
                onClick={() => onTriggerMedia("Armar_Caja")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Se empieza a pickear y explicación de fineline (MAJORS)
              </button>
              {/* Audio Karen Independiente */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Audio de Karen 
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerMedia("audio_karen")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    🎤
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      Perspectiva de Karen
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PUNTO CRITICO/ VALIDACIONES
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ▶ Audio
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onTriggerMedia("Armar_Caja_Boutique")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Se empieza a pickear (Boutiques)
              </button>
              {/* Audio Nai Independiente */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Audio de Nai 
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerMedia("audio_nai")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    🎤
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      Perspectiva de Nai
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PUNTO CRITICO/ VALIDACIONES
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    ▶ Audio
                  </span>
                </button>
              </div>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">3. El warehouse termina de armar la caja</p>
              <button
                type="button"
                onClick={() => onTriggerMedia("cajaLista")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:  `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                Caja armada - Ejemplo
              </button>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">4. Etapa PS: El warehouse (Ana) imprime durante el transcurso del día las etiquetas que armamos manualmente y enviamos por correo electrónico, junto con los packing lists y las carton labels, en caso de ser necesarias. Luego prepara las cajas, dejando todo listo para la llegada del camión de UPS, prevista aproximadamente entre las 16:00 y las 17:00 hs.</p>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">5. LLega el camion de UPS y se lleva las cajas a sus destinos</p>


            </div>
          )}
          {s.id === "shipping" && ( //WAREHOUSE ETAPA RETURNS EDITAR ACA
            <div className="w-full mt-3 space-y-4">
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">{s.warehouse}</p>
              {/* Video Ari Returns */}
              <button
                type="button"
                onClick={() => onTriggerMedia("ari_returns")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    warehouseAccent?.icon ??
                    `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Video del Warehouse
              </button>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">
                1. Se separan las prendas por marca.
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">2. Se Escanea cada prenda en Two Boxes.</div>
              {/* Video Ari Returns */}
              <button
                type="button"
                onClick={() => onTriggerMedia("two_boxes")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    warehouseAccent?.icon ??
                    `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Video de Two Boxes
              </button>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">3. Realizan el Quality Check de cada prenda.</div>

                
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">4. Cierran el return en el sistema.</div>

                
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">5. Notifican por Slack que el proceso fue completado (con el numero de guia)</div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">6. Cuando una caja se llena, se le da locación en los racks.</div>
            </div>
          )}
        </div>
      </div>
      {imageModal && (
        <ImageModal
          open={true}
          onClose={() => setImageModal(null)}
          src={imageModal.src}
          alt={imageModal.alt}
        />
      )}
    </div>
  );
}

// Componente Core Unificado para Multimedia (Mantiene intacta la UI/UX/Layout original)
function MediaModal({ resourceKey, onClose }: { resourceKey: string | null; onClose: () => void }) {
  if (!resourceKey) return null;

  const resource = MEDIA_RESOURCES[resourceKey];
  if (!resource) return null;

  const isAudio = resource.type === "audio";
  const isImage = resource.type === "image";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      {/* 1. RENDERIZADO EXCLUSIVO PARA IMÁGENES (Aislado para evitar herencia de tamaños de video) */}
      {isImage ? (
        <div
          className="relative w-auto max-w-[95vw] md:max-w-4xl rounded-2xl border border-border bg-card p-3 shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="mb-2 text-sm font-bold px-1 text-muted-foreground">
            {resource.title}
          </div>

          <div className="max-h-[80vh] overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
            <img
              src={resource.src}
              alt={resource.title}
              className="h-auto max-h-[70vh] w-auto max-w-full object-contain block mx-auto rounded-lg shadow-sm"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      ) : (
        /* 2. RENDERIZADO PARA VIDEOS Y AUDIOS (Mantiene intacto tu layout original de la plataforma) */
        <div
          className={`relative w-full ${isAudio ? 'max-w-md' : 'max-w-3xl'} rounded-2xl border border-border bg-card p-4 shadow-2xl transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="mb-2 text-sm font-bold px-1 text-muted-foreground">
            {resource.title}
          </div>

          {isAudio ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 p-6 border border-border/40">
              <div className="mb-4 text-4xl animate-pulse">🎤</div>
              <audio
                className="w-full h-12 accent-primary"
                src={resource.src}
                controls
                autoPlay
              />
            </div>
          ) : (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                className="h-full w-full"
                src={resource.src}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniList({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs">
            <span className="text-primary">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Activity({
  activity,
  phaseVar,
  onTriggerMedia,
}: {
  activity: {
    title: string;
    detail?: string;
    blocks?: { type: string; content?: string; action?: ActionType }[];
    items?: string[];
  };
  phaseVar: string;
  onTriggerMedia: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [openFineline, setOpenFineline] = useState(false);
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null);
  const hasBody = activity.detail || activity.items?.length || activity.blocks?.length;
  const showSlackExample = activity.title === "1. Slack confirma llegada";

  const exampleItems: Record<string, { src: string; alt: string }> = {
    "Llegan por mail": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de recepción por mail" },
    "Ya las tenes cuando te mandaron el cargamento": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de envío de cargamento" },
    "Las tenes que buscar en la plataforma que usa la marca": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de plataforma de la marca" },
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => hasBody && setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full" style={{ background: `var(${phaseVar})` }} />
          <span className="text-sm font-semibold">{activity.title}</span>
        </div>
        {hasBody && (
          <span className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}>
            ›
          </span>
        )}
      </button>
      {hasBody && open && (
        <div className="border-t border-border px-4 py-3">
          {activity.detail && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {activity.detail}
            </p>
          )}

          {activity.blocks && (
            <div className="space-y-3">
              {activity.blocks.map((block, idx) => {
                if (block.type === "text") {
                  return (
                    <div
                      key={idx}
                      className="text-sm leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: block.content || "" }}
                    />
                  );
                }

                if (block.type === "button" && block.action) {
                  const action = block.action;

                  const currentResource = MEDIA_RESOURCES[action];
                  const resourceType = currentResource
                    ? currentResource.type
                    : undefined;

                  const Icon =
                    block.action === "box"
                      ? PackageOpen
                      : resourceType === "image"
                        ? ScanLine
                        : ClipboardList;

                  return (
                    <div key={idx} className="space-y-3">
                      {activity.title === "Mandar a armar las órdenes" &&
                        action === "mandar_a_armar_orden" && (
                          <div className="rounded-xl border border-border bg-secondary/20 overflow-hidden">
                            <button
                              onClick={() => setOpenFineline(!openFineline)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold hover:bg-secondary/40 transition-colors"
                            >
                              <span>🏷️ Información sobre Fineline (Solo Majors)</span>

                              <span
                                className={`transition-transform ${openFineline ? "rotate-90" : ""
                                  }`}
                              >
                                ›
                              </span>
                            </button>

                            {openFineline && (
                              <div className="border-t border-border p-4 space-y-4 text-sm text-muted-foreground">
                                <p className="leading-relaxed">
                                  La mayoría de las órdenes <strong>Major</strong>{" "}
                                  requieren <strong>reetiquetado (Fineline)</strong>.
                                  Esto significa que el warehouse debe reemplazar las
                                  etiquetas originales de la mercadería por las
                                  etiquetas solicitadas por la marca. Estas deben
                                  contener el barcode y toda la información requerida
                                  por el cliente.
                                </p>

                                <div>
                                  <h4 className="font-semibold text-foreground mb-2">
                                    Antes de comenzar el proceso verificar:
                                  </h4>

                                  <ul className="space-y-2 list-disc pl-5">
                                    <li>Si la orden requiere o no Fineline.</li>

                                    <li>
                                      Que las etiquetas Fineline ya hayan sido
                                      recibidas en el warehouse.
                                    </li>

                                    <li>Si la orden requiere Hangers.</li>
                                  </ul>
                                </div>

                                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                                  <h4 className="font-semibold text-yellow-900 mb-2">
                                    Importante
                                  </h4>

                                  <p className="text-yellow-900 leading-relaxed">
                                    Las etiquetas Fineline pueden ser enviadas por la
                                    marca o adquiridas por nuestro equipo.
                                    Independientemente de quién las provea, es
                                    fundamental anticipar su gestión para que, cuando la
                                    mercadería llegue al warehouse, las etiquetas ya se
                                    encuentren disponibles.
                                  </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      "https://drive.google.com/drive/folders/1L72v9unY_jTAdUreHthTsxpTrNmyF3aO?usp=sharing",
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                  className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
                                >
                                  Ver carpeta de Finelines
                                </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => {
                          if (action === "crossDockGuide") {
                            window.open(
                              MEDIA_RESOURCES.crossDockGuide.src,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          } else {
                            onTriggerMedia(action);
                          }
                        }}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {block.content}
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {activity.items && (
            <ul className="mt-2 space-y-1.5">
              {activity.items.map((it, i) => {
                const itemExample = exampleItems[it];

                return (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-1 text-primary">•</span>
                      <span className="min-w-0 break-words">{it}</span>
                    </div>

                    {itemExample && (
                      <button
                        type="button"
                        onClick={() => setImageModal(itemExample)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Ver Ejemplo
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {showSlackExample && (
            <button
              onClick={() =>
                setImageModal({
                  src: slackConfirmaLlegadaAsset,
                  alt: "Ejemplo de confirmación en Slack",
                })
              }
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
            >
              <ScanLine className="h-3.5 w-3.5 text-primary" />
              Ver Ejemplo
            </button>
          )}
        </div>
      )}
      {imageModal && (
        <ImageModal
          open={true}
          onClose={() => setImageModal(null)}
          src={imageModal.src}
          alt={imageModal.alt}
        />
      )}
    </div>
  );
}

function ImageModal({
  open,
  onClose,
  src,
  alt,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="max-h-[85vh] w-full overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="h-auto w-full max-h-[85vh] object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-bold">{value}</span>
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
  const [modalOpen, setModalOpen] = useState(false);
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
                    className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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

        {activeModalImage && (
          <ImageModal
            open={!!activeModalImage}
            onClose={() => setActiveModalImage(null)}
            src={
              activeModalImage === "marca"
                ? DependeMarca
                : activeModalImage === "mapa"
                  ? mapa
                  : hero
            }
            alt={
              activeModalImage === "marca"
                ? "Depende de la Marca"
                : activeModalImage === "mapa"
                  ? "Mapa del Warehouse"
                  : "La marca envía un cargamento"
            }
          />
        )}

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
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active === h.number
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