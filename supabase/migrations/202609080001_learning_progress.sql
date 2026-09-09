-- Apply only to the selected development project. No existing content tables are modified.
begin;
create table public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  node_id text not null check (length(node_id) <= 120 and node_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  field text not null check (field in ('read','understood','practiced','legacyLearned')),
  value boolean not null,
  version bigint not null check (version between 1 and 9007199254740991),
  content_revision text check (length(content_revision) <= 200),
  updated_at timestamptz not null default now(),
  primary key (user_id, node_id, field)
);
create table public.learning_operations (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  request jsonb not null,
  receipt jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);
alter table public.learning_progress enable row level security;
alter table public.learning_operations enable row level security;
revoke all on public.learning_progress, public.learning_operations from anon, authenticated;
grant select on public.learning_progress to authenticated;
create policy own_progress on public.learning_progress for select to authenticated
  using ((select auth.uid()) = user_id);
-- Writes go exclusively through the versioned function. Neither client can
-- update version numbers, supply another user's ID, or alter operation receipts.
create function public.apply_learning_operation(
  p_operation_id uuid, p_node_id text, p_field text, p_value boolean,
  p_expected_version bigint, p_content_revision text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  current_row public.learning_progress%rowtype;
  old_op public.learning_operations%rowtype;
  payload jsonb;
  result jsonb;
  record_json jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id = uid) then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_operation_id is null or p_node_id is null or length(p_node_id) > 120
     or p_node_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or p_field is null or p_field not in ('read','understood','practiced','legacyLearned')
     or p_value is null or p_expected_version is null or p_expected_version < 0
     or p_expected_version >= 9007199254740991 or length(p_content_revision) > 200 then
    raise exception 'Invalid operation' using errcode = '22023';
  end if;
  -- Serialize this user's small progress transactions, including first inserts.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  payload := jsonb_build_object('nodeId',p_node_id,'field',p_field,'value',p_value,
    'expectedVersion',p_expected_version,'contentRevision',p_content_revision);
  select * into old_op from public.learning_operations where user_id=uid and operation_id=p_operation_id;
  if found then
    if old_op.request <> payload then raise exception 'Operation ID reused with different input' using errcode='22023'; end if;
    return old_op.receipt;
  end if;
  select * into current_row from public.learning_progress where user_id=uid and node_id=p_node_id and field=p_field;
  if coalesce(current_row.version,0) <> p_expected_version then
    record_json := jsonb_build_object('nodeId',p_node_id,'field',p_field,'value',coalesce(current_row.value,false),
      'version',coalesce(current_row.version,0),'contentRevision',current_row.content_revision);
    result := jsonb_build_object('status','conflict','record',record_json);
  else
    insert into public.learning_progress(user_id,node_id,field,value,version,content_revision)
      values(uid,p_node_id,p_field,p_value,p_expected_version+1,p_content_revision)
      on conflict(user_id,node_id,field) do update set value=excluded.value,
        version=excluded.version,content_revision=excluded.content_revision,updated_at=now()
      returning * into current_row;
    record_json := jsonb_build_object('nodeId',p_node_id,'field',p_field,'value',current_row.value,
      'version',current_row.version,'contentRevision',current_row.content_revision);
    result := jsonb_build_object('status','applied','record',record_json);
  end if;
  insert into public.learning_operations(user_id,operation_id,request,receipt) values(uid,p_operation_id,payload,result);
  return result;
end;
$$;
revoke all on function public.apply_learning_operation(uuid,text,text,boolean,bigint,text) from public, anon;
grant execute on function public.apply_learning_operation(uuid,text,text,boolean,bigint,text) to authenticated;
commit;
