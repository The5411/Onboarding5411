import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { findNavItem, isEditableItem, useContentTree } from "@/lib/onboarding/content.queries";
import { DocSectionsEditor } from "@/components/admin/DocSectionsEditor";
import { DirectoryEditor } from "@/components/admin/DirectoryEditor";
import { ChecklistEditor } from "@/components/admin/ChecklistEditor";
import { FlowContentEditor } from "@/components/admin/FlowContentEditor";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, isEditor, isLoading: authLoading } = useAuth();
  const { tracks, isLoading: treeLoading } = useContentTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isEditor)) {
      navigate({ to: "/" });
    }
  }, [authLoading, user, isEditor, navigate]);

  if (authLoading || !isEditor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const resolved = selectedId ? findNavItem(tracks, selectedId) : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 flex-shrink-0 border-r border-border p-4">
        <Link
          to="/"
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la app
        </Link>
        <h1 className="mb-4 text-lg font-bold">Panel de Editor</h1>
        {treeLoading && <p className="text-sm text-muted-foreground">Cargando contenido...</p>}
        <nav className="space-y-4">
          {tracks.map((track) => {
            const editableItems = track.items.filter(isEditableItem);
            if (editableItems.length === 0) return null;
            return (
              <div key={track.id}>
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {track.label}
                </div>
                <ul className="space-y-1">
                  {editableItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          selectedId === item.id
                            ? "bg-secondary font-semibold text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {!resolved ? (
          <p className="text-sm text-muted-foreground">
            Elegí una sección de la izquierda para editarla.
          </p>
        ) : (
          <div className={resolved.item.view === "flow" ? "max-w-4xl" : "max-w-3xl"}>
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {resolved.track.label}
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">{resolved.item.label}</h2>
            </div>

            {resolved.item.view === "doc" && (
              <DocSectionsEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                sections={resolved.item.sections}
              />
            )}
            {resolved.item.view === "directory" && resolved.item.dataSource.type === "static" && (
              <DirectoryEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                columns={resolved.item.dataSource.columns}
                rows={resolved.item.dataSource.rows}
              />
            )}
            {resolved.item.view === "checklist" && (
              <ChecklistEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                items={resolved.item.items}
              />
            )}
            {resolved.item.view === "flow" && (
              <FlowContentEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                stages={resolved.item.stages}
                faqs={resolved.item.faqs}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
