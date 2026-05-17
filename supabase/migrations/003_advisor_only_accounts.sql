alter table public.profiles alter column role set default 'advisor';

update public.profiles
set role = 'advisor', updated_at = now()
where role = 'buyer';
