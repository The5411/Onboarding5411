import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SNAPSHOT_PREFIX = "onboarding5411:last-saved:";

function readSnapshot<T>(itemId: string): T | null {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_PREFIX + itemId);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSnapshot<T>(itemId: string, content: T) {
  try {
    window.localStorage.setItem(SNAPSHOT_PREFIX + itemId, JSON.stringify(content));
  } catch {
    // localStorage lleno o bloqueado (modo privado, etc.) — el undo es un
    // extra, no debe romper el guardado real si falla.
  }
}

function clearSnapshot(itemId: string) {
  try {
    window.localStorage.removeItem(SNAPSHOT_PREFIX + itemId);
  } catch {
    // ver arriba
  }
}

// Estado compartido por todos los editores de /admin: contenido local +
// "dirty" (cambios sin guardar, con aviso al cerrar/refrescar la pestaña) +
// guardado con feedback (toast) + un snapshot del último guardado en
// localStorage para poder deshacerlo (un solo nivel, no es historial
// completo — para eso haría falta una tabla nueva en Supabase).
export function useContentEditorState<T>(
  itemId: string,
  initial: T,
  persist: (content: T) => Promise<void>,
  onDirtyChange?: (dirty: boolean) => void,
) {
  const queryClient = useQueryClient();
  const [content, setContentState] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUndo, setHasUndo] = useState(() => readSnapshot<T>(itemId) !== null);
  const lastSavedRef = useRef(initial);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setContent = (updater: T | ((prev: T) => T)) => {
    setDirty(true);
    onDirtyChange?.(true);
    setContentState(updater);
  };

  const save = async () => {
    setSaving(true);
    try {
      await persist(content);
      writeSnapshot(itemId, lastSavedRef.current);
      setHasUndo(true);
      lastSavedRef.current = content;
      setDirty(false);
      onDirtyChange?.(false);
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      toast.success("Guardado");
    } catch {
      toast.error("No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const undoLastSave = () => {
    const snapshot = readSnapshot<T>(itemId);
    if (!snapshot) return;
    setContentState(snapshot);
    setDirty(true);
    onDirtyChange?.(true);
    clearSnapshot(itemId);
    setHasUndo(false);
    toast("Se restauró la última versión guardada. Revisá y guardá para confirmarlo.");
  };

  return { content, setContent, dirty, saving, hasUndo, save, undoLastSave };
}
