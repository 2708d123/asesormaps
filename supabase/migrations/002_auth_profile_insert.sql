do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles own insert'
  ) then
    create policy "profiles own insert"
    on public.profiles
    for insert
    with check (id = auth.uid());
  end if;
end $$;

insert into public.plans (name, price_mxn, max_active_properties, features)
values
  ('Inicial', 149, 10, array['Perfil publico', 'Catalogo compartible', 'WhatsApp directo', 'Soporte basico']),
  ('Profesional', 299, 40, array['Badge de asesor verificado', 'Metricas basicas', 'Leads organizados', 'Propiedades destacadas limitadas']),
  ('Premium', 499, 100, array['Perfil destacado', 'Mas visibilidad en catalogo', 'Metricas avanzadas', 'Fichas PDF', 'Soporte prioritario'])
on conflict do nothing;
