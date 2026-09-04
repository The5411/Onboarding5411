import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useContentTree } from "@/lib/onboarding/content.queries";
import { HOME_ICON, HOME_ID, type NavItem } from "@/lib/onboarding/nav-tree";

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
}

// Paleta de comandos global (Cmd/Ctrl+K) para saltar directo a cualquier
// sección sin tener que buscarla a mano en la barra lateral. Reusa el mismo
// `useContentTree()` que ya está cacheado por React Query — no pega de
// nuevo a Supabase al abrirse.
export function CommandPalette({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const { tracks } = useContentTree();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar una sección... (Ctrl/Cmd + K)" />
      <CommandList>
        <CommandEmpty>No se encontró nada.</CommandEmpty>
        <CommandGroup heading="General">
          <CommandItem
            value="Inicio"
            onSelect={() => {
              onSelect(HOME_ID);
              setOpen(false);
            }}
          >
            <HOME_ICON className="h-4 w-4" />
            Inicio
          </CommandItem>
        </CommandGroup>
        {tracks.map((track) => {
          const items = flatten(track.items);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={track.id} heading={track.label}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${track.label} ${item.label}`}
                    onSelect={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
