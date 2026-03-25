-- Staff login credentials & permissions for mobile app
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS login_pin       text,           -- 4-6 digit PIN set by clinic owner
  ADD COLUMN IF NOT EXISTS permissions     jsonb NOT NULL DEFAULT '{
    "can_mark_attendance": true,
    "can_view_appointments": true,
    "can_manage_inventory": false,
    "can_view_patients": true,
    "can_add_patients": false,
    "can_view_payroll": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS device_token    text,           -- FCM push token for notifications
  ADD COLUMN IF NOT EXISTS last_login_at   timestamptz,
  ADD COLUMN IF NOT EXISTS last_lat        float8,         -- last known location lat
  ADD COLUMN IF NOT EXISTS last_lng        float8,         -- last known location lng
  ADD COLUMN IF NOT EXISTS last_location_at timestamptz;

COMMENT ON COLUMN staff.login_pin IS 'Hashed PIN for mobile app login (bcrypt or SHA256)';
COMMENT ON COLUMN staff.permissions IS 'JSON permissions object controlling what staff can do in the app';
