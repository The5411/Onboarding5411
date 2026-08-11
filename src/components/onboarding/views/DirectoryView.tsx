import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEmployeesSheet } from "@/lib/api/sheets.functions";
import type { DirectoryColumn, DirectoryDataSource } from "@/lib/onboarding/nav-tree";

export function DirectoryView({ dataSource }: { dataSource: DirectoryDataSource }) {
  if (dataSource.type === "sheet") {
    return <SheetDirectory visibleColumns={dataSource.visibleColumns} />;
  }
  return <DirectoryTable columns={dataSource.columns} rows={dataSource.rows} />;
}

function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterColumns(columns: DirectoryColumn[], visibleColumns?: string[]): DirectoryColumn[] {
  if (!visibleColumns || visibleColumns.length === 0) return columns;
  const wanted = visibleColumns.map(normalizeLabel);
  return wanted
    .map((label) => columns.find((col) => normalizeLabel(col.label) === label))
    .filter((col): col is DirectoryColumn => col !== undefined);
}

function SheetDirectory({ visibleColumns }: { visibleColumns?: string[] }) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["sheet-table", "empleados"],
    queryFn: () => getEmployeesSheet(),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando datos del Google Sheet...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "No se pudo cargar el Google Sheet."}
      </div>
    );
  }

  return (
    <DirectoryTable
      columns={filterColumns(data?.columns ?? [], visibleColumns)}
      rows={data?.rows ?? []}
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    />
  );
}

function DirectoryTable({
  columns,
  rows,
  onRefresh,
  isRefreshing,
}: {
  columns: DirectoryColumn[];
  rows: Record<string, string>[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Todavía no hay datos cargados para esta sección.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No se encontraron resultados para "{query}".
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{row[col.key] ?? "—"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
