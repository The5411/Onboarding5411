import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/onboarding/AppSidebar";
import { CommandPalette } from "@/components/onboarding/CommandPalette";
import { ContentPanel } from "@/components/onboarding/ContentPanel";
import { HOME_ID } from "@/lib/onboarding/nav-tree";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Onboarding 5411 — Guía Interactiva" },
      {
        name: "description",
        content:
          "Guía interactiva de onboarding 5411: empresa, cultura, y el proceso operativo de Wholesale paso a paso.",
      },
      { property: "og:title", content: "Onboarding 5411 — Guía Interactiva" },
      {
        property: "og:description",
        content: "Explorá el onboarding de 5411 por área: Empresa, Wholesale y E-commerce.",
      },
    ],
  }),
  component: OnboardingApp,
});

function OnboardingApp() {
  const [selectedId, setSelectedId] = useState<string>(HOME_ID);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar selectedId={selectedId} onSelect={setSelectedId} />
      <SidebarInset>
        <ContentPanel selectedId={selectedId} onSelect={setSelectedId} />
      </SidebarInset>
      <CommandPalette onSelect={setSelectedId} />
    </SidebarProvider>
  );
}
