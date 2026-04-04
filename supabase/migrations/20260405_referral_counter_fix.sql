create or replace function public.protect_user_role_changes()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.email := old.email;
    new.referral_code := old.referral_code;

    if current_setting('app.allow_referral_counter_update', true) <> '1' then
      new.successful_referrals := old.successful_referrals;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.apply_referral_code(
  p_user_id uuid,
  p_referral_code text
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user public.users%rowtype;
  v_referrer public.users%rowtype;
  v_successful_referral_count integer;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required';
  end if;

  if auth.role() <> 'service_role' and auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'You can only apply a referral to your own account';
  end if;

  select * into v_user from public.users where id = p_user_id;
  if v_user.id is null or v_user.referral_applied <> '' then
    raise exception 'Referral code cannot be applied';
  end if;

  select * into v_referrer from public.users where referral_code = p_referral_code and id <> p_user_id;
  if v_referrer.id is null then
    raise exception 'Referral code not found';
  end if;

  update public.users
  set referral_applied = p_referral_code
  where id = p_user_id;

  perform set_config('app.allow_referral_counter_update', '1', true);

  update public.users
  set successful_referrals = array_append(coalesce(successful_referrals, '{}'::uuid[]), p_user_id)
  where id = v_referrer.id
    and not (coalesce(successful_referrals, '{}'::uuid[]) @> array[p_user_id]::uuid[]);

  insert into public.referrals (referrer_user_id, referred_user_id, referral_code, status)
  values (v_referrer.id, p_user_id, p_referral_code, 'successful')
  on conflict (referred_user_id) do update
    set referrer_user_id = excluded.referrer_user_id,
        referral_code = excluded.referral_code,
        status = excluded.status,
        updated_at = timezone('utc', now());

  select count(*) into v_successful_referral_count
  from public.referrals
  where referrer_user_id = v_referrer.id
    and status in ('successful', 'rewarded');

  return jsonb_build_object(
    'referralCode', v_user.referral_code,
    'appliedReferralCode', p_referral_code,
    'successfulReferralCount', v_successful_referral_count
  );
end;
$$;

select set_config('app.allow_referral_counter_update', '1', true);

with computed_referrals as (
  select
    u.id,
    coalesce(
      array_agg(r.referred_user_id order by r.created_at) filter (
        where r.referred_user_id is not null
          and r.status in ('successful', 'rewarded')
      ),
      '{}'::uuid[]
    ) as successful_referrals
  from public.users u
  left join public.referrals r
    on r.referrer_user_id = u.id
  group by u.id
)
update public.users u
set successful_referrals = computed_referrals.successful_referrals
from computed_referrals
where u.id = computed_referrals.id
  and u.successful_referrals is distinct from computed_referrals.successful_referrals;
