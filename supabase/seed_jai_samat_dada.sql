-- ============================================================
-- SEED DATA: Jai Samat Dada Clinic (subdomain: jaisamatdada)
-- Run this in Supabase SQL Editor to test all features end-to-end
-- ============================================================

-- ── 1. Staff Members ──────────────────────────────────────────
INSERT INTO staff (subdomain, name, role, phone, email, salary, join_date, status, notes, login_pin, permissions)
VALUES
  ('jaisamatdada', 'Dr. Prajwal Rathod',   'doctor',        '8788739131', 'diwin87578@fabaos.com', 80000, '2023-01-15', 'active', 'Clinic owner and primary physician', '1234',
   '{"can_mark_attendance":true,"can_view_appointments":true,"can_manage_inventory":true,"can_view_patients":true,"can_add_patients":true,"can_view_payroll":true}'::jsonb),
  ('jaisamatdada', 'Nurse Sunita Patil',   'nurse',         '9876501234', 'sunita.patil@example.com', 22000, '2023-03-01', 'active', 'OPD nurse, experienced in wound care', '2222',
   '{"can_mark_attendance":true,"can_view_appointments":true,"can_manage_inventory":true,"can_view_patients":true,"can_add_patients":true,"can_view_payroll":false}'::jsonb),
  ('jaisamatdada', 'Ramesh Shelke',        'receptionist',  '9765432101', 'ramesh.shelke@example.com', 18000, '2023-06-10', 'active', 'Front desk, appointment scheduling', '3333',
   '{"can_mark_attendance":true,"can_view_appointments":true,"can_manage_inventory":false,"can_view_patients":true,"can_add_patients":true,"can_view_payroll":false}'::jsonb),
  ('jaisamatdada', 'Priya Jadhav',         'compounder',    '9823456780', null, 15000, '2024-01-05', 'active', 'Medicine dispensing', '4444',
   '{"can_mark_attendance":true,"can_view_appointments":false,"can_manage_inventory":true,"can_view_patients":false,"can_add_patients":false,"can_view_payroll":false}'::jsonb),
  ('jaisamatdada', 'Ajay Kamble',          'ward_boy',      '9012345678', null, 12000, '2023-09-20', 'active', 'Cleaning and patient transport', '5555',
   '{"can_mark_attendance":true,"can_view_appointments":false,"can_manage_inventory":false,"can_view_patients":false,"can_add_patients":false,"can_view_payroll":false}'::jsonb)
ON CONFLICT DO NOTHING;

-- ── 2. Attendance (last 7 days) ───────────────────────────────
DO $$
DECLARE
  s RECORD;
  d DATE;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::interval)::date LOOP
    FOR s IN SELECT id FROM staff WHERE subdomain = 'jaisamatdada' LOOP
      INSERT INTO attendance (subdomain, staff_id, date, status)
      VALUES (
        'jaisamatdada',
        s.id,
        d,
        CASE
          WHEN d = CURRENT_DATE - 2 AND s.id = (SELECT id FROM staff WHERE subdomain='jaisamatdada' AND role='ward_boy' LIMIT 1)
            THEN 'absent'
          WHEN d = CURRENT_DATE - 1 AND s.id = (SELECT id FROM staff WHERE subdomain='jaisamatdada' AND role='nurse' LIMIT 1)
            THEN 'half_day'
          ELSE 'present'
        END
      )
      ON CONFLICT (staff_id, date) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ── 3. Leave Requests ─────────────────────────────────────────
INSERT INTO leaves (subdomain, staff_id, leave_type, start_date, end_date, days_count, reason, status)
SELECT
  'jaisamatdada',
  (SELECT id FROM staff WHERE subdomain='jaisamatdada' AND role='nurse' LIMIT 1),
  'sick', CURRENT_DATE + 3, CURRENT_DATE + 5, 3,
  'Seasonal flu', 'pending'
WHERE EXISTS (SELECT 1 FROM staff WHERE subdomain='jaisamatdada' AND role='nurse')
ON CONFLICT DO NOTHING;

INSERT INTO leaves (subdomain, staff_id, leave_type, start_date, end_date, days_count, reason, status)
SELECT
  'jaisamatdada',
  (SELECT id FROM staff WHERE subdomain='jaisamatdada' AND role='receptionist' LIMIT 1),
  'casual', CURRENT_DATE - 10, CURRENT_DATE - 9, 2,
  'Family function', 'approved'
WHERE EXISTS (SELECT 1 FROM staff WHERE subdomain='jaisamatdada' AND role='receptionist')
ON CONFLICT DO NOTHING;

-- ── 4. Payroll (current month) ────────────────────────────────
INSERT INTO salary_payments (subdomain, staff_id, month, year, base_salary, bonus, deductions, status, paid_date)
SELECT
  'jaisamatdada',
  s.id,
  EXTRACT(MONTH FROM CURRENT_DATE)::int,
  EXTRACT(YEAR FROM CURRENT_DATE)::int,
  s.salary,
  CASE WHEN s.role = 'doctor' THEN 5000 ELSE 500 END,
  0,
  CASE WHEN s.role IN ('doctor','nurse') THEN 'paid' ELSE 'pending' END,
  CASE WHEN s.role IN ('doctor','nurse') THEN CURRENT_DATE - 3 ELSE NULL END
FROM staff s
WHERE s.subdomain = 'jaisamatdada'
ON CONFLICT (staff_id, month, year) DO NOTHING;

-- ── 5. Inventory Items ────────────────────────────────────────
INSERT INTO inventory_items (subdomain, name, category, unit, current_stock, min_stock_alert, cost_price, sell_price, supplier, expiry_date, barcode)
VALUES
  -- Medicines
  ('jaisamatdada', 'Paracetamol 500mg',        'Medicine',   'tablets',  850,  100, 0.50,  2.00,  'Sun Pharma',       CURRENT_DATE + 180, 'MED001-PARA500'),
  ('jaisamatdada', 'Amoxicillin 500mg',         'Medicine',   'capsules', 200,  50,  4.50, 12.00,  'Cipla Ltd',        CURRENT_DATE + 90,  'MED002-AMOX500'),
  ('jaisamatdada', 'Metformin 500mg',           'Medicine',   'tablets',  500,  80,  1.20,  4.00,  'Sun Pharma',       CURRENT_DATE + 270, 'MED003-MET500'),
  ('jaisamatdada', 'ORS Sachet',                'Medicine',   'sachets',  8,    20,  2.00,  5.00,  'Piramal Health',   CURRENT_DATE + 365, 'MED004-ORS'),
  ('jaisamatdada', 'Cetirizine 10mg',           'Medicine',   'tablets',  300,  50,  0.80,  3.00,  'Alkem Labs',       CURRENT_DATE + 200, 'MED005-CET10'),
  ('jaisamatdada', 'Azithromycin 500mg',        'Medicine',   'tablets',  3,    15,  8.00, 22.00,  'Cipla Ltd',        CURRENT_DATE + 120, 'MED006-AZI500'),
  -- Consumables
  ('jaisamatdada', 'Disposable Syringes 5ml',   'Consumable', 'units',   120,  50,  3.50,  8.00,  'Dispovan',         CURRENT_DATE + 730, 'CON001-SYR5'),
  ('jaisamatdada', 'Surgical Gloves (M)',        'Consumable', 'pairs',   80,   30,  8.00, 15.00,  'Ansell',           CURRENT_DATE + 365, 'CON002-GLVM'),
  ('jaisamatdada', 'Bandage 10cm',               'Consumable', 'rolls',   25,   10,  12.00, 25.00, 'Johnson & Johnson', CURRENT_DATE + 730, 'CON003-BND10'),
  ('jaisamatdada', 'Cotton Wool 100g',           'Consumable', 'units',   15,   10,  28.00, 50.00, 'Local Supplier',   null,               'CON004-COT'),
  ('jaisamatdada', 'Betadine Solution 100ml',    'Consumable', 'units',   12,   5,   45.00, 80.00, 'Win-Medicare',     CURRENT_DATE + 365, 'CON005-BET'),
  -- General
  ('jaisamatdada', 'Thermometer Digital',        'General',    'units',   4,    2,   180.00, 350.00,'Rossmax',          null,               'GEN001-THERM'),
  ('jaisamatdada', 'BP Monitor Cuff',            'Equipment',  'units',   2,    1,   1200.00, 0.00, 'Omron',            null,               'EQP001-BPCUF'),
  -- Expired item for testing alerts
  ('jaisamatdada', 'Expired Cough Syrup',        'Medicine',   'bottles', 5,    2,   35.00, 60.00, 'Old Supplier',     CURRENT_DATE - 15,  'MED999-EXP')
ON CONFLICT DO NOTHING;

-- ── 6. Inventory Transactions ─────────────────────────────────
INSERT INTO inventory_transactions (subdomain, item_id, type, quantity, unit_price, reason, staff_name)
SELECT 'jaisamatdada', id, 'in', 500, 0.50, 'Initial stock purchase', 'Dr. Prajwal'
FROM inventory_items WHERE subdomain='jaisamatdada' AND name='Paracetamol 500mg'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (subdomain, item_id, type, quantity, unit_price, reason, staff_name)
SELECT 'jaisamatdada', id, 'out', 50, 2.00, 'OPD patient use - Morning', 'Nurse Sunita'
FROM inventory_items WHERE subdomain='jaisamatdada' AND name='Paracetamol 500mg'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (subdomain, item_id, type, quantity, unit_price, reason, staff_name)
SELECT 'jaisamatdada', id, 'in', 100, 4.50, 'Monthly restock', 'Priya Jadhav'
FROM inventory_items WHERE subdomain='jaisamatdada' AND name='Amoxicillin 500mg'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (subdomain, item_id, type, quantity, unit_price, reason, staff_name)
SELECT 'jaisamatdada', id, 'out', 20, 12.00, 'Prescribed to 4 patients', 'Dr. Prajwal'
FROM inventory_items WHERE subdomain='jaisamatdada' AND name='Amoxicillin 500mg'
ON CONFLICT DO NOTHING;

-- ── 7. Patients ───────────────────────────────────────────────
INSERT INTO patients (subdomain, name, phone, email, date_of_birth, gender, blood_group, address, allergies, chronic_conditions, notes)
VALUES
  ('jaisamatdada', 'Rahul Deshmukh',    '9876543210', 'rahul.d@example.com',   '1985-04-12', 'male',   'B+', 'Koregaon Park, Pune',   ARRAY['Penicillin'],           ARRAY['Hypertension'],          'Regular patient, visits monthly'),
  ('jaisamatdada', 'Anjali Mehta',      '9821234567', 'anjali.m@example.com',  '1992-08-25', 'female', 'O+', 'Kothrud, Pune',         ARRAY[]::text[],               ARRAY['Diabetes Type 2'],       'On insulin, monitor HbA1c'),
  ('jaisamatdada', 'Suresh Kulkarni',   '9765098765', null,                    '1955-11-03', 'male',   'A+', 'Sadashiv Peth, Pune',   ARRAY[]::text[],               ARRAY['Arthritis','BP'],        'Elderly, needs regular checkup'),
  ('jaisamatdada', 'Meena Sharma',      '9034512345', 'meena.s@example.com',   '1990-02-14', 'female', 'AB+','Wakad, Pune',           ARRAY['Aspirin'],              ARRAY[]::text[],                'Pregnancy follow-up patient'),
  ('jaisamatdada', 'Ravi Patkar',       '9123456789', null,                    '1978-07-30', 'male',   'O-', 'Hadapsar, Pune',        ARRAY[]::text[],               ARRAY['Asthma'],                'Inhaler prescription'),
  ('jaisamatdada', 'Kavya Joshi',       '9988776655', 'kavya.j@example.com',   '2010-03-18', 'female', 'B+', 'Viman Nagar, Pune',     ARRAY[]::text[],               ARRAY[]::text[],                'Paediatric patient'),
  ('jaisamatdada', 'Deepak Naik',       '9870012345', null,                    '1965-12-01', 'male',   'A-', 'Chinchwad, Pune',       ARRAY['Sulfa drugs'],          ARRAY['Diabetes','Thyroid'],    'Requires fasting blood tests')
ON CONFLICT DO NOTHING;

-- ── 8. Patient Visits ─────────────────────────────────────────
INSERT INTO patient_visits (subdomain, patient_id, visit_date, visit_type, chief_complaint, diagnosis, prescription, vitals, doctor_name, fees_charged, payment_status)
SELECT
  'jaisamatdada',
  p.id,
  CURRENT_DATE - 5,
  'opd',
  'Fever and headache for 3 days',
  'Viral fever, mild upper respiratory infection',
  'Paracetamol 500mg TDS x 5 days, ORS sachets, rest and fluids',
  '{"bp":"118/76","pulse":92,"temp":"101.2°F","spo2":"98%","weight":"72kg"}'::jsonb,
  'Dr. Prajwal Rathod',
  300,
  'paid'
FROM patients p WHERE p.subdomain='jaisamatdada' AND p.name='Rahul Deshmukh'
ON CONFLICT DO NOTHING;

INSERT INTO patient_visits (subdomain, patient_id, visit_date, visit_type, chief_complaint, diagnosis, prescription, vitals, doctor_name, fees_charged, payment_status)
SELECT
  'jaisamatdada',
  p.id,
  CURRENT_DATE - 2,
  'follow_up',
  'Routine diabetes checkup',
  'T2DM - controlled. HbA1c 7.2%',
  'Continue Metformin 500mg BD. Diet control. Recheck in 3 months.',
  '{"bp":"128/82","pulse":78,"temp":"98.6°F","spo2":"99%","weight":"68kg"}'::jsonb,
  'Dr. Prajwal Rathod',
  200,
  'paid'
FROM patients p WHERE p.subdomain='jaisamatdada' AND p.name='Anjali Mehta'
ON CONFLICT DO NOTHING;

INSERT INTO patient_visits (subdomain, patient_id, visit_date, visit_type, chief_complaint, diagnosis, prescription, vitals, doctor_name, fees_charged, payment_status)
SELECT
  'jaisamatdada',
  p.id,
  CURRENT_DATE,
  'opd',
  'Knee pain and swelling',
  'Osteoarthritis right knee',
  'Diclofenac gel topical, Glucosamine supplement, physiotherapy advised',
  '{"bp":"142/88","pulse":70,"temp":"98.4°F","spo2":"97%","weight":"82kg"}'::jsonb,
  'Dr. Prajwal Rathod',
  350,
  'pending'
FROM patients p WHERE p.subdomain='jaisamatdada' AND p.name='Suresh Kulkarni'
ON CONFLICT DO NOTHING;

-- ── 9. Follow-up Reminders ────────────────────────────────────
INSERT INTO patient_followups (subdomain, patient_id, visit_id, followup_date, reason, status)
SELECT
  'jaisamatdada',
  pv.patient_id,
  pv.id,
  CURRENT_DATE + 5,
  'Check recovery from viral fever. Review if symptoms persist.',
  'scheduled'
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.subdomain='jaisamatdada' AND p.name='Rahul Deshmukh'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO patient_followups (subdomain, patient_id, followup_date, reason, status)
SELECT
  'jaisamatdada',
  p.id,
  CURRENT_DATE + 90,
  'HbA1c recheck after 3 months. Fasting blood sugar.',
  'scheduled'
FROM patients p WHERE p.subdomain='jaisamatdada' AND p.name='Anjali Mehta'
ON CONFLICT DO NOTHING;

INSERT INTO patient_followups (subdomain, patient_id, followup_date, reason, status)
SELECT
  'jaisamatdada',
  p.id,
  CURRENT_DATE + 14,
  'Physiotherapy progress review for knee arthritis.',
  'scheduled'
FROM patients p WHERE p.subdomain='jaisamatdada' AND p.name='Suresh Kulkarni'
ON CONFLICT DO NOTHING;

-- ── 10. Analytics events ──────────────────────────────────────
INSERT INTO analytics (subdomain, event_type, page, referrer)
VALUES
  ('jaisamatdada', 'page_view',       '/',          'https://www.google.com'),
  ('jaisamatdada', 'page_view',       '/',          'https://www.google.com'),
  ('jaisamatdada', 'page_view',       '/services',  null),
  ('jaisamatdada', 'whatsapp_click',  '/',          null),
  ('jaisamatdada', 'page_view',       '/',          null),
  ('jaisamatdada', 'form_submit',     '/contact',   null),
  ('jaisamatdada', 'page_view',       '/about',     'https://www.facebook.com'),
  ('jaisamatdada', 'whatsapp_click',  '/',          null),
  ('jaisamatdada', 'page_view',       '/',          null),
  ('jaisamatdada', 'page_view',       '/',          'https://www.google.com');

-- ── Done ──────────────────────────────────────────────────────
SELECT 'Seed complete!' as status,
  (SELECT count(*) FROM staff WHERE subdomain='jaisamatdada') as staff_count,
  (SELECT count(*) FROM inventory_items WHERE subdomain='jaisamatdada') as inventory_items,
  (SELECT count(*) FROM patients WHERE subdomain='jaisamatdada') as patients,
  (SELECT count(*) FROM patient_visits WHERE subdomain='jaisamatdada') as visits,
  (SELECT count(*) FROM patient_followups WHERE subdomain='jaisamatdada') as followups;
