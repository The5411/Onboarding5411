import { useMemo, useState } from "react";
import { Check, ChevronRight, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { HOME_ICON, HOME_ID, TRACKS } from "@/lib/onboarding/nav-tree";

export function AppSidebar({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { getGroupProgress } = useOnboardingProgress();
  const [query, setQuery] = useState("");
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TRACKS.map((track) => [track.id, !!track.defaultOpen])),
  );

  const normalizedQuery = query.trim().toLowerCase();

  const visibleItemsByTrack = useMemo(() => {
    if (!normalizedQuery) return null;
    const result: Record<string, boolean[]> = {};
    for (const track of TRACKS) {
      result[track.id] = track.items.map((item) =>
        item.label.toLowerCase().includes(normalizedQuery),
      );
    }
    return result;
  }, [normalizedQuery]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <SidebarInput
            type="search"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedId === HOME_ID}
                onClick={() => onSelect(HOME_ID)}
                className="font-bold"
              >
                <HOME_ICON className="text-primary" />
                <span>Inicio</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {TRACKS.map((track) => {
          const matches = visibleItemsByTrack?.[track.id];
          if (matches && !matches.some(Boolean)) return null;

          const isOpen = normalizedQuery ? true : (openTracks[track.id] ?? false);
          const { done, total } = getGroupProgress(track.id);
          const isComplete = total > 0 && done === total;
          const TrackIcon = track.icon;

          return (
            <SidebarGroup key={track.id}>
              <button
                type="button"
                onClick={() => setOpenTracks((prev) => ({ ...prev, [track.id]: !isOpen }))}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 rounded-md bg-sidebar-accent/60 px-2 py-2 text-sm font-bold text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
                <TrackIcon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-left uppercase tracking-wide">{track.label}</span>
                {isComplete ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="font-mono text-[10px] font-normal text-sidebar-foreground/60">
                    {done}/{total}
                  </span>
                )}
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <SidebarMenu className="mt-1 ml-3.5 border-l border-sidebar-border pl-2.5">
                    {track.items.map((item, i) => {
                      if (matches && !matches[i]) return null;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={selectedId === item.id}
                            onClick={() => onSelect(item.id)}
                            className="font-normal text-sidebar-foreground/80 data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground"
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              </div>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
