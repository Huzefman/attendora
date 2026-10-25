-- 0044_attendance_location_policy.sql
-- Location is context, not a gate, by default.
--
--   off    → do not evaluate location for check-in
--   flag   → allow check-in; set is_geo_flagged when outside/unavailable
--   strict → block check-in when outside the geofence (previous behaviour)

insert into public.app_config (key, value, description)
values (
  'attendance_location_policy',
  'flag',
  'Attendance location policy: off, flag, or strict'
)
on conflict (key) do nothing;
