-- All operational data is private. Only the verified Edge API can read/write.
-- Each school document is one optimistic transaction: record + audit + account
-- state either all commit, or the caller retries after checking fresh permissions.
create table public.s4_schools (
 id text primary key,
 code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9-]{2,15}$'),
 data jsonb not null check (jsonb_typeof(data)='object' and data->'school'->>'id'=id and data->'school'->>'code'=code),
 revision bigint not null default 1 check (revision>0),
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.s4_schools enable row level security;
revoke all on public.s4_schools from public,anon,authenticated;
grant select,insert,update,delete on public.s4_schools to service_role;
create table public.s4_rate_limits (key text primary key,n integer not null,reset_at timestamptz not null);
alter table public.s4_rate_limits enable row level security;
revoke all on public.s4_rate_limits from public,anon,authenticated;
grant select,insert,update,delete on public.s4_rate_limits to service_role;
create or replace function public.s4_rate_limit(p_key text,p_max integer,p_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_n integer;
begin
 delete from public.s4_rate_limits where reset_at < now()-interval '1 hour';
 insert into public.s4_rate_limits(key,n,reset_at) values (p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set n=case when s4_rate_limits.reset_at<now() then 1 else s4_rate_limits.n+1 end,
 reset_at=case when s4_rate_limits.reset_at<now() then now()+make_interval(secs=>p_seconds) else s4_rate_limits.reset_at end returning n into v_n;
 return v_n<=p_max;
end $$;
revoke all on function public.s4_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.s4_rate_limit(text,integer,integer) to service_role;
comment on table public.s4_schools is 'Private school documents; CAS revision commits keep access, assessments, session revocations and audit atomic. Deny direct browser access; use standard4-api.';
