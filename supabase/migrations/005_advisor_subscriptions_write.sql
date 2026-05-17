do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'advisor manage own subscriptions'
  ) then
    create policy "advisor manage own subscriptions"
    on public.subscriptions
    for all
    using (
      exists (
        select 1
        from public.advisor_profiles a
        where a.id = advisor_id
          and a.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1
        from public.advisor_profiles a
        where a.id = advisor_id
          and a.user_id = auth.uid()
      )
    );
  end if;
end $$;
