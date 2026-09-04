import { Undo2 } from "lucide-react";

export function SaveBar({
  saving,
  hasUndo,
  onSave,
  onUndo,
  label = "Guardar cambios",
}: {
  saving: boolean;
  hasUndo: boolean;
  onSave: () => void;
  onUndo: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
        style={{ background: "var(--gradient-hero)" }}
      >
        {saving ? "Guardando..." : label}
      </button>
      {hasUndo && (
        <button
          type="button"
          onClick={onUndo}
          title="Vuelve el contenido a como estaba antes del último guardado — hay que guardar de nuevo para confirmarlo"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Deshacer último guardado
        </button>
      )}
    </div>
  );
}
