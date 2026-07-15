export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Quiz = {
  title: string;
  description: string;
  phaseVar: string;
  questions: QuizQuestion[];
};

export const QUIZZES: Record<string, Quiz> = {
  inbound: {
    title: "Simulacro — Inbound",
    description:
      "Poné a prueba lo que aprendiste sobre la entrada de mercadería al warehouse.",
    phaseVar: "--phase-1",
    questions: [
      {
        question: "¿Qué significa ASN?",
        options: [
          "Advanced Shipping Notice (Aviso de Envío Anticipado)",
          "Automated Stock Number",
          "Approved Shipment Note",
          "Aviso de Salida de Nave",
        ],
        correctIndex: 0,
        explanation:
          "ASN = Advanced Shipping Notice, el aviso anticipado que se carga en Mintsoft con el detalle de la mercadería que va a llegar.",
      },
      {
        question:
          "Antes de empezar a cargar un ASN, ¿qué es lo primero que hay que verificar?",
        options: [
          "Que el ASN se esté generando para el cliente correcto",
          "Que el warehouse tenga stock disponible",
          "Que la caja esté armada",
          "Que el tracking ya haya llegado",
        ],
        correctIndex: 0,
        explanation:
          "Siempre hay que filtrar al cliente correcto antes de empezar a cargar el ASN para evitar errores.",
      },
      {
        question:
          "¿Qué estado debe tener el ASN para que Samuel pueda visualizarlo en el warehouse?",
        options: ["PENDING", "AWAITING DELIVERY", "IN TRANSIT", "CLOSED"],
        correctIndex: 1,
        explanation:
          "El ASN debe estar en estado 'AWAITING DELIVERY'; si no, Samuel no podrá visualizarlo.",
      },
      {
        question: "Al crear las cajas en Mintsoft, ¿qué opción hay que seleccionar siempre?",
        options: ["Standard Transit", "RS Transit", "Direct Delivery", "Cross Dock"],
        correctIndex: 1,
        explanation: "Siempre se debe seleccionar la opción 'RS Transit' al crear las cajas.",
      },
      {
        question: "¿Cuándo se envían las carton labels al warehouse?",
        options: [
          "Apenas se genera el ASN",
          "Cuando confirman por Slack que las cajas llegaron físicamente",
          "Al finalizar el mes",
          "Antes de que la mercadería salga del origen",
        ],
        correctIndex: 1,
        explanation:
          "Las carton labels se envían recién cuando se confirma por Slack que las cajas llegaron físicamente al warehouse.",
      },
      {
        question: "Si un producto no está creado en el sistema, ¿qué hay que hacer al cargar el ASN?",
        options: [
          "Omitirlo y cargarlo después",
          "Incluir sus códigos de barra (barcodes)",
          "Cancelar el ASN",
          "Avisar directamente a la marca sin cargar nada",
        ],
        correctIndex: 1,
        explanation:
          "Si un producto no está creado, hay que incluir sus códigos de barra (barcodes) al cargar el ASN.",
      },
      {
        question: "En la etapa de validación 'Tracking vs ASN', ¿qué se compara?",
        options: [
          "El precio de los productos contra la factura",
          "Las unidades físicas contra el ASN cargado en sistema",
          "El peso de las cajas contra el manifiesto",
          "El tracking contra el packing list del cliente anterior",
        ],
        correctIndex: 1,
        explanation:
          "Se comparan las unidades físicas escaneadas contra el ASN cargado en sistema, y luego se envía el ASN Report a la marca.",
      },
      {
        question: "¿Cuál es el formato correcto del código de un Carton?",
        options: [
          "Nombre de marca + fecha",
          "Primeras dos letras + últimos 6 dígitos del tracking + número de caja",
          "Número de ASN + número de caja",
          "Código de barras del producto + caja",
        ],
        correctIndex: 1,
        explanation:
          "Ejemplo: MO-468889-1 → primeras dos letras + últimos 6 dígitos del tracking + número de caja.",
      },
    ],
  },
  outbound: {
    title: "Simulacro — Outbound",
    description:
      "Poné a prueba lo que aprendiste sobre la preparación de órdenes de salida.",
    phaseVar: "--phase-4",
    questions: [
      {
        question: "¿Cuáles son los dos tipos en los que se clasifican las órdenes?",
        options: [
          "Urgente y Normal",
          "Major y Boutique",
          "Nacional e Internacional",
          "Nueva y Devolución",
        ],
        correctIndex: 1,
        explanation: "Las órdenes se clasifican en Major y Boutique.",
      },
      {
        question: "¿Cuál es la diferencia entre Cross Dock y Pick & Pack?",
        options: [
          "Cross Dock es solo para returns, Pick & Pack es solo para majors",
          "Cross Dock: ingreso y despacho inmediato. Pick & Pack: preparación de pedidos a partir de la mercadería recibida",
          "No hay diferencia, son sinónimos",
          "Cross Dock se usa cuando falta stock",
        ],
        correctIndex: 1,
        explanation:
          "Cross Dock implica ingreso y despacho inmediato de la mercadería; Pick & Pack implica preparar pedidos a partir de la mercadería ya recibida.",
      },
      {
        question: "¿Qué significa que una orden esté en estado PACKED?",
        options: [
          "Que todavía falta pickear la mercadería",
          "Que el pedido ya fue procesado (pickeo y packeo) y está listo para despachar",
          "Que la orden fue cancelada",
          "Que está esperando aprobación del cliente",
        ],
        correctIndex: 1,
        explanation:
          "PACKED significa que el warehouse ya hizo el pickeo y packeo, y el pedido está listo para ser despachado.",
      },
      {
        question:
          "Si una orden no está aprobada para salir, ¿dónde se debe indicar esa condición al cargarla en Mintsoft?",
        options: [
          "En el campo Packing Notes",
          "En el asunto del mail",
          "En el Tracker únicamente",
          "No es necesario indicarlo",
        ],
        correctIndex: 0,
        explanation:
          "Se debe indicar 'No aprobada para salir' en el campo Packing Notes al cargar la orden en Mintsoft.",
      },
      {
        question: "¿Cuál es el cutoff de pickup?",
        options: ["12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
        correctIndex: 2,
        explanation:
          "El cutoff de pickup es a las 4:00 PM. El warehouse cierra a las 5:00 PM; si no está listo antes del cutoff, queda retenido para el día siguiente.",
      },
      {
        question:
          "¿Cuál es el orden correcto de estados de una orden en el Tracker?",
        options: [
          "Packed → Entered → Packing → Shipped",
          "Entered → Packing → Packed → Routed → Shipped",
          "Routed → Entered → Shipped → Packed",
          "Shipped → Packed → Packing → Entered",
        ],
        correctIndex: 1,
        explanation: "El flujo en el Tracker es: Entered → Packing → Packed → Routed → Shipped.",
      },
      {
        question: "¿Qué significa que una orden quede en estado ONBACKORDER?",
        options: [
          "Que la orden fue cancelada por la marca",
          "Que el stock existe pero no está ubicado correctamente, o aún no llegó / no se procesó",
          "Que la caja ya fue despachada",
          "Que falta la autorización del cliente",
        ],
        correctIndex: 1,
        explanation:
          "ONBACKORDER indica que el stock existe pero no está bien ubicado, o que todavía no llegó o no se procesó.",
      },
      {
        question:
          "Para órdenes con más de 1 caja que ya tienen aprobación para salir, ¿con qué asunto se envía el mail al warehouse?",
        options: ["'URGENTE'", "'PARA SALIR'", "'LISTO PARA PACKING'", "'APROBADO'"],
        correctIndex: 1,
        explanation:
          "Se envía todo al warehouse por correo con el asunto 'PARA SALIR' para que procedan con el despacho.",
      },
    ],
  },
};
