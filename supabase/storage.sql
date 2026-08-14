-- Onboarding 5411 — bucket de Storage para imágenes insertadas desde el
-- panel de Editor (Tiptap). Correr una sola vez en el SQL Editor, después
-- de schema.sql.

insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;

create policy "content-images: lectura pública"
  on storage.objects for select
  using (bucket_id = 'content-images');

create policy "content-images: solo editores pueden subir"
  on storage.objects for insert
  with check (
    bucket_id = 'content-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'editor')
  );

create policy "content-images: solo editores pueden borrar"
  on storage.objects for delete
  using (
    bucket_id = 'content-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'editor')
  );
