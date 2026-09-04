import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { findNavItem, isEditableItem, useContentTree } from "@/lib/onboarding/content.queries";
import type { NavItem } from "@/lib/onboarding/nav-tree";
import { DocSectionsEditor } from "@/components/admin/DocSectionsEditor";
import { DirectoryEditor } from "@/components/admin/DirectoryEditor";
import { ChecklistEditor } from "@/components/admin/ChecklistEditor";
import { FlowContentEditor } from "@/components/admin/FlowContentEditor";
import { FlowStageEditor } from "@/components/admin/FlowStageEditor";
import { NavStructureEditor } from "@/components/admin/NavStructureEditor";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, isEditor, isLoading: authLoading } = useAuth();
  const { tracks, isLoading: treeLoading } = useContentTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"content" | "structure">("content");
  const [isEditorDirty, setIsEditorDirty] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isEditor)) {
      navigate({ to: "/" });
    }
  }, [authLoading, user, isEditor, navigate]);

  // Confirma antes de perder cambios sin guardar cuando se navega a otra
  // sección o se cambia de modo (Contenido / Estructura) — el refresh o
  // cierre de pestaña ya lo cubre useContentEditorState con beforeunload.
  const selectItem = (id: string) => {
    if (
      isEditorDirty &&
      !window.confirm("Tenés cambios sin guardar en esta sección. ¿Salir igual y perderlos?")
    ) {
      return;
    }
    setIsEditorDirty(false);
    setSelectedId(id);
  };

  const selectMode = (next: "content" | "structure") => {
    if (
      isEditorDirty &&
      !window.confirm("Tenés cambios sin guardar en esta sección. ¿Salir igual y perderlos?")
    ) {
      return;
    }
    setIsEditorDirty(false);
    setMode(next);
  };

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
        <h1 className="mb-3 text-lg font-bold">Panel de Editor</h1>
        <div className="mb-4 flex gap-1 rounded-lg bg-secondary/50 p-1">
          <button
            type="button"
            onClick={() => selectMode("content")}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              mode === "content"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contenido
          </button>
          <button
            type="button"
            onClick={() => selectMode("structure")}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              mode === "structure"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Estructura
          </button>
        </div>
        {mode === "content" && (
          <>
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
                        <EditableItemLink
                          key={item.id}
                          item={item}
                          depth={0}
                          selectedId={selectedId}
                          onSelect={selectItem}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {mode === "structure" ? (
          <div className="max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Estructura de secciones</h2>
            <NavStructureEditor tracks={tracks} />
          </div>
        ) : !resolved ? (
          <p className="text-sm text-muted-foreground">
            Elegí una sección de la izquierda para editarla.
          </p>
        ) : (
          <div
            className={
              resolved.item.view === "flow" || resolved.item.view === "stage"
                ? "max-w-4xl"
                : "max-w-3xl"
            }
          >
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
                layout={resolved.item.layout}
                onDirtyChange={setIsEditorDirty}
              />
            )}
            {resolved.item.view === "directory" && resolved.item.dataSource.type === "static" && (
              <DirectoryEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                columns={resolved.item.dataSource.columns}
                rows={resolved.item.dataSource.rows}
                onDirtyChange={setIsEditorDirty}
              />
            )}
            {resolved.item.view === "checklist" && (
              <ChecklistEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                items={resolved.item.items}
                onDirtyChange={setIsEditorDirty}
              />
            )}
            {resolved.item.view === "flow" && (
              <FlowContentEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                intro={resolved.item.intro}
                faqs={resolved.item.faqs}
                roadmap={resolved.item.roadmap}
                onDirtyChange={setIsEditorDirty}
              />
            )}
            {resolved.item.view === "stage" && (
              <FlowStageEditor
                key={resolved.item.id}
                itemId={resolved.item.id}
                content={resolved.item}
                onDirtyChange={setIsEditorDirty}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Fila de la nav del panel de Editor — recursiva, para que las subsecciones
// (ej. las etapas de Flujo operativo) también se puedan seleccionar y editar.
function EditableItemLink({
  item,
  depth,
  selectedId,
  onSelect,
}: {
  item: NavItem;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const editableChildren = (item.children ?? []).filter(isEditableItem);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className={`flex w-full items-center justify-between gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors ${
          selectedId === item.id
            ? "bg-secondary font-semibold text-foreground"
            : "text-muted-foreground hover:bg-secondary/60"
        }`}
      >
        <span className="truncate">{item.label}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      </button>
      {editableChildren.length > 0 && (
        <ul className="space-y-1">
          {editableChildren.map((child) => (
            <EditableItemLink
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
