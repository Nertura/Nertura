-- Widen farm coordinate/area precision to prevent numeric overflow on create/update

alter table public.farms
  alter column latitude type numeric(10, 6),
  alter column longitude type numeric(10, 6),
  alter column total_area type numeric(12, 2);
