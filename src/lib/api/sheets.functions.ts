import { createServerFn } from "@tanstack/react-start";
import process from "node:process";

// Server function que lee una hoja de Google Sheets publicada como CSV y la
// devuelve como columnas + filas. La URL del Sheet vive en la env var
// EMPLOYEES_SHEET_URL (server-only, no llega al bundle del cliente) — hay
// que compartir la hoja como "Cualquiera con el enlace puede ver".

export type SheetTable = {
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
};

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toCsvExportUrl(shareUrl: string): string {
  const idMatch = shareUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) {
    throw new Error("No se pudo interpretar la URL del Google Sheet.");
  }
  const gidMatch = shareUrl.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid}`;
}

export const getEmployeesSheet = createServerFn({ method: "GET" }).handler(
  async (): Promise<SheetTable> => {
    const shareUrl = process.env.EMPLOYEES_SHEET_URL;
    if (!shareUrl) {
      throw new Error(
        "Falta configurar la variable de entorno EMPLOYEES_SHEET_URL con el link del Google Sheet de empleados.",
      );
    }

    const csvUrl = toCsvExportUrl(shareUrl);
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(
        `No se pudo leer el Google Sheet (status ${response.status}). Verificá que esté compartido como "Cualquiera con el enlace puede ver".`,
      );
    }

    const csv = await response.text();
    const table = parseCsv(csv);
    if (table.length === 0) {
      return { columns: [], rows: [] };
    }

    const header = table[0];
    const columns = header.map((label, i) => ({
      key: label.trim().toLowerCase().replace(/\s+/g, "_") || `col_${i}`,
      label: label.trim() || `Columna ${i + 1}`,
    }));

    const rows = table.slice(1).map((cells) => {
      const record: Record<string, string> = {};
      columns.forEach((col, i) => {
        record[col.key] = (cells[i] ?? "").trim();
      });
      return record;
    });

    return { columns, rows };
  },
);
