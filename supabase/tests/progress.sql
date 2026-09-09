\set ON_ERROR_STOP on
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$
declare first_result jsonb; replay jsonb; conflict jsonb;
begin
  first_result := public.apply_learning_operation('10000000-0000-4000-8000-000000000001','supervised-learning','read',true,0);
  if first_result->>'status' <> 'applied' then raise exception 'first write failed'; end if;
  replay := public.apply_learning_operation('10000000-0000-4000-8000-000000000001','supervised-learning','read',true,0);
  if replay <> first_result then raise exception 'replay not idempotent'; end if;
  begin
    perform public.apply_learning_operation('10000000-0000-4000-8000-000000000001','supervised-learning','read',false,0);
    raise exception 'operation ID reuse accepted';
  exception when invalid_parameter_value then null; end;
  conflict := public.apply_learning_operation('10000000-0000-4000-8000-000000000002','supervised-learning','read',false,0);
  if conflict->>'status' <> 'conflict' then raise exception 'stale update accepted'; end if;
  perform public.apply_learning_operation('10000000-0000-4000-8000-000000000003','supervised-learning','read',false,1);
  if (select value from public.learning_progress) then raise exception 'cancellation lost'; end if;
  begin
    update public.learning_progress set value=true;
    raise exception 'direct write accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.learning_operations;
    raise exception 'private receipts exposed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ begin
  if (select count(*) from public.learning_progress) <> 0 then raise exception 'account B can read account A'; end if;
  perform public.apply_learning_operation('10000000-0000-4000-8000-000000000001','supervised-learning','read',true,0);
  if (select count(*) from public.learning_progress) <> 1 then raise exception 'account B write failed'; end if;
end $$;
set local role anon;
do $$ begin
  begin
    perform * from public.learning_progress;
    raise exception 'anonymous read accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.apply_learning_operation('10000000-0000-4000-8000-000000000004','supervised-learning','read',true,0);
    raise exception 'anonymous write accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id='00000000-0000-4000-8000-000000000001';
do $$ begin
  if exists(select 1 from public.learning_progress where user_id='00000000-0000-4000-8000-000000000001')
     or exists(select 1 from public.learning_operations where user_id='00000000-0000-4000-8000-000000000001') then
    raise exception 'account deletion did not cascade';
  end if;
end $$;
rollback;
select 'PASS: RLS, independent accounts, anonymous denial, RPC-only writes, replay, conflict, cancellation, cascade';
