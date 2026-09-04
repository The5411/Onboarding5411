import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, LogOut, Search, Settings, Star } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { findNavItem, useContentTree } from "@/lib/onboarding/content.queries";
import { getLeafIds, HOME_ICON, HOME_ID, type NavItem } from "@/lib/onboarding/nav-tree";

function itemMatchesQuery(item: NavItem, query: string): boolean {
  if (item.label.toLowerCase().includes(query)) return true;
  return item.children?.some((child) => itemMatchesQuery(child, query)) ?? false;
}

// Fila de un item de sidebar, recursiva: si tiene `children` (subsecciones),
// se puede expandir/contraer y se renderiza a sí misma para cada hijo, un
// nivel más adentro. `forceExpanded` la mantiene abierta mientras se busca,
// para que un resultado en una subsección no quede escondido.
function NavItemRow({
  item,
  depth,
  selectedId,
  onSelect,
  forceExpanded,
  isFavorite,
  toggleFavorite,
}: {
  item: NavItem;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
  forceExpanded: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!item.children?.length;
  const isOpen = forceExpanded || open;
  const Icon = item.icon;
  const favorite = isFavorite(item.id);

  return (
    <SidebarMenuItem>
      <div className="group/row flex items-center gap-0.5">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={isOpen ? "Contraer" : "Expandir"}
            className="flex h-6 w-5 shrink-0 items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="h-6 w-5 shrink-0" />
        )}
        <SidebarMenuButton
          isActive={selectedId === item.id}
          onClick={() => onSelect(item.id)}
          className="flex-1 font-normal text-sidebar-foreground/80 data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground"
        >
          <Icon />
          <span>{item.label}</span>
        </SidebarMenuButton>
        <button
          type="button"
          onClick={() => toggleFavorite(item.id)}
          aria-label={favorite ? "Quitar de favoritos" : "Marcar como favorito"}
          aria-pressed={favorite}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-opacity ${
            favorite
              ? "text-primary opacity-100"
              : "text-sidebar-foreground/40 opacity-0 hover:text-sidebar-foreground group-hover/row:opacity-100"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>
      {hasChildren && isOpen && (
        <SidebarMenu className="mt-0.5 ml-3.5 border-l border-sidebar-border pl-2.5">
          {item.children!.map((child) => (
            <NavItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              forceExpanded={forceExpanded}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </SidebarMenu>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { getGroupProgress } = useOnboardingProgress();
  const { user, profile, signOut } = useAuth();
  const { tracks } = useContentTree();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({});

  const normalizedQuery = query.trim().toLowerCase();
  const favoriteItems = favorites
    .map((id) => findNavItem(tracks, id)?.item)
    .filter((item): item is NavItem => !!item);

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

        {!normalizedQuery && favoriteItems.length > 0 && (
          <SidebarGroup>
            <div className="mb-1 flex items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-wide text-sidebar-foreground/70">
              <Star className="h-3 w-3 fill-current text-primary" />
              Favoritos
            </div>
            <SidebarMenu>
              {favoriteItems.map((item) => (
                <NavItemRow
                  key={item.id}
                  item={item}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  forceExpanded={false}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {tracks.map((track) => {
          const visibleItems = normalizedQuery
            ? track.items.filter((item) => itemMatchesQuery(item, normalizedQuery))
            : track.items;
          if (normalizedQuery && visibleItems.length === 0) return null;

          const isOpen = normalizedQuery ? true : (openTracks[track.id] ?? !!track.defaultOpen);
          const { done, total } = getGroupProgress(track.items.flatMap(getLeafIds));
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
                    {visibleItems.map((item) => (
                      <NavItemRow
                        key={item.id}
                        item={item}
                        depth={0}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        forceExpanded={!!normalizedQuery}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                      />
                    ))}
                  </SidebarMenu>
                </div>
              </div>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-sidebar-foreground">
              {user?.email?.split("@")[0]}
            </div>
            {profile?.role === "editor" && (
              <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                Editor
              </div>
            )}
          </div>
          {profile?.role === "editor" && (
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              aria-label="Panel de Editor"
              className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Cerrar sesión"
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
