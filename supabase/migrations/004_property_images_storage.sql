insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public read property images'
  ) then
    create policy "public read property images"
    on storage.objects
    for select
    using (bucket_id = 'property-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'authenticated upload property images'
  ) then
    create policy "authenticated upload property images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'property-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'authenticated update own property images'
  ) then
    create policy "authenticated update own property images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'property-images' and owner = auth.uid())
    with check (bucket_id = 'property-images' and owner = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'authenticated delete own property images'
  ) then
    create policy "authenticated delete own property images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'property-images' and owner = auth.uid());
  end if;
end $$;
