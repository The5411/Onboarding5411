import { Plus, Trash2 } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DirectoryColumn } from "@/lib/onboarding/nav-tree";

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

      <button
        type="button"
        onClick={addRow}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
      >
        <Plus className="h-4 w-4" />
        Agregar fila
      </button>

      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
    </div>
  );
}
