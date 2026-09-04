import { useRef, useState } from "react";
import { ClipboardPaste, Plus, Trash2, Upload } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DirectoryColumn } from "@/lib/onboarding/nav-tree";

// Saca acentos (normaliza a NFD y descarta las marcas diacríticas
// combinantes por code point) para poder matchear "Teléfono" con
// "telefono" al importar encabezados pegados desde una planilla.
function normalize(value: string): string {
  return Array.from(value.trim().toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join("");
}

// Parser chico de CSV/TSV (soporta celdas entre comillas con comas/tabs
// adentro) — alcanza para lo que se pega desde Excel/Google Sheets o se
// exporta como .csv, sin necesitar una librería nueva para esto.
function splitDelimited(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function parseTable(text: string): string[][] {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  return lines.map((line) => splitDelimited(line, delimiter));
}

// Si la primera fila pegada coincide (ignorando mayúsculas/acentos) con los
// nombres de las columnas ya definidas, la trata como encabezado y matchea
// por nombre — si no, asume que viene en el mismo orden que las columnas.
function mapRowsToColumns(
  parsed: string[][],
  columns: DirectoryColumn[],
): { rows: Record<string, string>[]; usedHeader: boolean } {
  if (parsed.length === 0) return { rows: [], usedHeader: false };

  const normalizedColumnLabels = columns.map((c) => normalize(c.label));
  const normalizedFirst = parsed[0].map(normalize);
  const usedHeader =
    normalizedFirst.length > 0 &&
    normalizedFirst.every((cell) => normalizedColumnLabels.includes(cell));

  const dataLines = usedHeader ? parsed.slice(1) : parsed;
  const sourceIndexByColumn = columns.map((col, colIndex) =>
    usedHeader
      ? normalizedFirst.findIndex((h) => h === normalizedColumnLabels[colIndex])
      : colIndex,
  );

  const rows = dataLines.map((line) => {
    const row: Record<string, string> = {};
    columns.forEach((col, colIndex) => {
      const sourceIndex = sourceIndexByColumn[colIndex];
      row[col.key] = sourceIndex >= 0 ? (line[sourceIndex] ?? "") : "";
    });
    return row;
  });

  return { rows, usedHeader };
}

export function DirectoryEditor({
  itemId,
  columns,
  rows: initialRows,
  onDirtyChange,
}: {
  itemId: string;
  columns: DirectoryColumn[];
  rows: Record<string, string>[];
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    content: rows,
    setContent: setRows,
    saving,
    hasUndo,
    save,
    undoLastSave,
  } = useContentEditorState(
    itemId,
    initialRows,
    (rows) => updateNavItemContent(itemId, { dataSource: { type: "static", columns, rows } }),
    onDirtyChange,
  );
  const [importOpen, setImportOpen] = useState(false);

  const updateCell = (index: number, key: string, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, Object.fromEntries(columns.map((c) => [c.key, ""]))]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-left font-semibold text-muted-foreground">
                  {col.label}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="p-2">
                    <input
                      value={row[col.key] ?? ""}
                      onChange={(e) => updateCell(i, col.key, e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                    aria-label="Borrar fila"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
        >
          <Plus className="h-4 w-4" />
          Agregar fila
        </button>
        <button
          type="button"
          onClick={() => setImportOpen((prev) => !prev)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
        >
          <ClipboardPaste className="h-4 w-4" />
          Importar tabla de una
        </button>
      </div>

      {importOpen && (
        <TableImportPanel
          columns={columns}
          onImport={(newRows, mode) => {
            setRows((prev) => (mode === "replace" ? newRows : [...prev, ...newRows]));
            setImportOpen(false);
          }}
          onCancel={() => setImportOpen(false)}
        />
      )}

      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
    </div>
  );
}

function TableImportPanel({
  columns,
  onImport,
  onCancel,
}: {
  columns: DirectoryColumn[];
  onImport: (rows: Record<string, string>[], mode: "append" | "replace") => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = parseTable(text);
  const { rows: previewRows, usedHeader } = mapRowsToColumns(parsed, columns);

  const handleFile = async (file: File) => {
    setText(await file.text());
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-border bg-secondary/20 p-4">
      <div>
        <p className="text-sm font-semibold">Importar filas de una</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pegá directo desde Excel/Google Sheets (seleccioná y copiá las celdas), o subí un archivo
          .csv. Podés incluir una fila de encabezados con estos mismos nombres —{" "}
          {columns.map((c) => c.label).join(", ")} — o pegar los datos directamente en ese orden.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`${columns.map((c) => c.label).join("\t")}\n...`}
        rows={5}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Upload className="h-3.5 w-3.5" />
          Subir .csv
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {previewRows.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {previewRows.length} fila{previewRows.length === 1 ? "" : "s"} detectada
            {previewRows.length === 1 ? "" : "s"}
            {usedHeader ? " (con encabezado)" : " (sin encabezado, por orden de columnas)"}
          </span>
        )}
      </div>

      {previewRows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th key={col.key} className="p-1.5 text-left font-semibold text-muted-foreground">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="truncate p-1.5">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewRows.length > 5 && (
            <p className="p-1.5 text-[11px] text-muted-foreground">
              ...y {previewRows.length - 5} fila{previewRows.length - 5 === 1 ? "" : "s"} más.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={previewRows.length === 0}
          onClick={() => onImport(previewRows, "append")}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-40"
          style={{ background: "var(--gradient-hero)" }}
        >
          Agregar {previewRows.length || ""} fila{previewRows.length === 1 ? "" : "s"}
        </button>
        <button
          type="button"
          disabled={previewRows.length === 0}
          onClick={() => onImport(previewRows, "replace")}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary disabled:opacity-40"
          title="Borra las filas que ya estaban cargadas y las reemplaza por estas"
        >
          Reemplazar tabla entera
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
