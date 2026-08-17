import { supabase } from "@/lib/supabase/client";

// Sube un archivo al bucket público "content-images" (mismo bucket que usa
// el botón de insertar imagen del editor de texto enriquecido) y devuelve su
// URL pública. Usado por RichTextEditor y por SlideImagesEditor.
export async function uploadContentImage(file: File): Promise<string> {
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("content-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("content-images").getPublicUrl(path);
  return data.publicUrl;
}
