import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DocSection } from "@/lib/onboarding/nav-tree";

export function DocSectionsEditor({
  itemId,
  sections: initialSections,
  onDirtyChange,
}: {
  itemId: string;
  sections: DocSection[];
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    content: sections,
    setContent: setSections,
    saving,
    hasUndo,
    save,
    undoLastSave,
  } = useContentEditorState(
    itemId,
    initialSections,
    (sections) => updateNavItemContent(itemId, { sections }),
    onDirtyChange,
  );

  return (
    <div className="space-y-4">
      <SectionListEditor sections={sections} onChange={setSections} />
      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
    </div>
  );
}
