-- خطوة: مخطط Supabase. نفّذه كاملًا في SQL Editor.
-- Authentication > Providers > Email: فعّل البريد. لتسهيل التسجيل عطّل "Confirm email" (أو أبقه وسيصل المستخدم رابط تأكيد).

create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'عضو',
  created_at timestamptz not null default now());

create table if not exists public.posts(
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author text not null default 'عضو',
  body text not null check (char_length(body) between 1 and 500),
  likes int not null default 0,
  comments int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now());
create index if not exists posts_created on public.posts(created_at desc);

create table if not exists public.likes(
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  primary key(post_id,user_id));

create table if not exists public.comments(
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author text not null default 'عضو',
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now());

create table if not exists public.reports(
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason text default '',
  created_at timestamptz not null default now(),
  unique(post_id,user_id));

create table if not exists public.notifications(
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text default '',
  data jsonb default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now());
create index if not exists notif_user on public.notifications(user_id,created_at desc);

create table if not exists public.user_settings(
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  shortcuts jsonb,
  prefs jsonb,
  updated_at timestamptz not null default now());

-- ===== triggers =====
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,display_name)
  values(new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'عضو'));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_author() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  new.author := coalesce((select display_name from public.profiles where id=new.user_id),'عضو');
  return new;
end $$;
drop trigger if exists posts_author on public.posts;
create trigger posts_author before insert on public.posts for each row execute function public.set_author();
drop trigger if exists comments_author on public.comments;
create trigger comments_author before insert on public.comments for each row execute function public.set_author();

create or replace function public.limit_posts() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if (select count(*) from public.posts where user_id=new.user_id and created_at>now()-interval '1 hour')>=10 then
    raise exception 'تجاوزت الحد المسموح، حاول لاحقًا';
  end if;
  return new;
end $$;
drop trigger if exists posts_limit on public.posts;
create trigger posts_limit before insert on public.posts for each row execute function public.limit_posts();

create or replace function public.on_like() returns trigger
language plpgsql security definer set search_path=public as $$
declare owner uuid; who text;
begin
  if tg_op='INSERT' then
    update public.posts set likes=likes+1 where id=new.post_id returning user_id into owner;
    if owner is not null and owner<>new.user_id then
      select display_name into who from public.profiles where id=new.user_id;
      insert into public.notifications(user_id,type,title,body,data)
      values(owner,'like',coalesce(who,'عضو')||' أعجبه منشورك','',jsonb_build_object('post',new.post_id));
    end if;
  else
    update public.posts set likes=greatest(likes-1,0) where id=old.post_id;
  end if;
  return null;
end $$;
drop trigger if exists likes_aiud on public.likes;
create trigger likes_aiud after insert or delete on public.likes for each row execute function public.on_like();

create or replace function public.on_comment() returns trigger
language plpgsql security definer set search_path=public as $$
declare owner uuid;
begin
  if tg_op='INSERT' then
    update public.posts set comments=comments+1 where id=new.post_id returning user_id into owner;
    if owner is not null and owner<>new.user_id then
      insert into public.notifications(user_id,type,title,body,data)
      values(owner,'comment',new.author||' علّق على منشورك',left(new.body,120),jsonb_build_object('post',new.post_id));
    end if;
  else
    update public.posts set comments=greatest(comments-1,0) where id=old.post_id;
  end if;
  return null;
end $$;
drop trigger if exists comments_aiud on public.comments;
create trigger comments_aiud after insert or delete on public.comments for each row execute function public.on_comment();

create or replace function public.on_report() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if (select count(*) from public.reports where post_id=new.post_id)>=3 then
    update public.posts set hidden=true where id=new.post_id;
  end if;
  return null;
end $$;
drop trigger if exists reports_ai on public.reports;
create trigger reports_ai after insert on public.reports for each row execute function public.on_report();

-- حذف الحساب (مطلوب في Google Play)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id=auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_upd on public.profiles;
create policy profiles_upd on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select to authenticated using (hidden=false or user_id=auth.uid());
drop policy if exists posts_ins on public.posts;
create policy posts_ins on public.posts for insert to authenticated with check (user_id=auth.uid());
drop policy if exists posts_del on public.posts;
create policy posts_del on public.posts for delete to authenticated using (user_id=auth.uid());

drop policy if exists likes_read on public.likes;
create policy likes_read on public.likes for select to authenticated using (true);
drop policy if exists likes_ins on public.likes;
create policy likes_ins on public.likes for insert to authenticated with check (user_id=auth.uid());
drop policy if exists likes_del on public.likes;
create policy likes_del on public.likes for delete to authenticated using (user_id=auth.uid());

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select to authenticated using (true);
drop policy if exists comments_ins on public.comments;
create policy comments_ins on public.comments for insert to authenticated with check (user_id=auth.uid());
drop policy if exists comments_del on public.comments;
create policy comments_del on public.comments for delete to authenticated using (user_id=auth.uid());

drop policy if exists reports_ins on public.reports;
create policy reports_ins on public.reports for insert to authenticated with check (user_id=auth.uid());

drop policy if exists notif_read on public.notifications;
create policy notif_read on public.notifications for select to authenticated using (user_id=auth.uid());
drop policy if exists notif_upd on public.notifications;
create policy notif_upd on public.notifications for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists notif_del on public.notifications;
create policy notif_del on public.notifications for delete to authenticated using (user_id=auth.uid());

drop policy if exists settings_all on public.user_settings;
create policy settings_all on public.user_settings for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
