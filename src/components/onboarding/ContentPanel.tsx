import { Check } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { HOME_ID } from "@/lib/onboarding/nav-tree";
import { findNavItem, useContentTree } from "@/lib/onboarding/content.queries";
import { HomeView } from "@/components/onboarding/HomeView";
import { FlowView } from "@/components/onboarding/views/FlowView";
import { DocView } from "@/components/onboarding/views/DocView";
import { DirectoryView } from "@/components/onboarding/views/DirectoryView";
import { ChecklistView } from "@/components/onboarding/views/ChecklistView";

export function ContentPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { progress, toggleItem } = useOnboardingProgress();
  const { tracks, isLoading } = useContentTree();
  const trigger = (
    <SidebarTrigger className="fixed left-3 top-3 z-40 rounded-lg bg-card shadow-md md:hidden" />
  );

  if (selectedId === HOME_ID) {
    return (
      <>
        {trigger}
        <HomeView onSelect={onSelect} />
      </>
    );
  }

  const resolved = findNavItem(tracks, selectedId);
  if (!resolved) {
    return (
      <div className="p-6 md:p-10">
        {trigger}
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Cargando..." : "Sección no encontrada."}
        </p>
      </div>
    );
  }

  const { track, item } = resolved;

  if (item.view === "flow") {
    return (
      <>
        {trigger}
        <FlowView />
      </>
    );
  }

  const completedLeafId = `${item.id}.completado`;
  const isCompleted = !!progress[completedLeafId];
  const showCompletedToggle = item.view === "doc" || item.view === "directory";

  return (
    <div className="p-6 md:p-10">
      {trigger}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {track.label}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{item.label}</h1>
        </div>
        {showCompletedToggle && (
          <button
            onClick={() => toggleItem(completedLeafId)}
            aria-pressed={isCompleted}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isCompleted
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card hover:bg-secondary"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {isCompleted ? "Completado" : "Marcar como completado"}
          </button>
        )}
      </div>

      {item.view === "doc" && <DocView sections={item.sections} layout={item.layout} />}
      {item.view === "directory" && <DirectoryView dataSource={item.dataSource} />}
      {item.view === "checklist" && <ChecklistView items={item.items} />}
    </div>
  );
}
