-- App configuration defaults
-- Seeded at deployment. Use Settings → App config to change values.
INSERT INTO app_config (key, value, description, updated_by) VALUES
  ('regularization_window_days', '7',        'Max calendar days in the past for attendance corrections', null),
  ('leave_sla_business_days',     '2',        'Business days before a pending time-off request is escalated', null),
  ('optional_holiday_limit_per_year', '2',   'Max optional holidays an employee can opt into per year',   null),
  ('auto_checkout_time',          '23:59:00', 'IST time at which auto-checkout runs (HH:MM:SS)',           null),
  ('rehire_carry_leave_balance',  'false',    'Carry time-off balance when an employee is rehired',        null),
  ('attendance_location_policy',  'flag',     'Attendance location policy: off, flag, or strict',          null)
ON CONFLICT (key) DO NOTHING;
