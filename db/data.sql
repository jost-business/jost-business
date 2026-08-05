-- Seed data for travel_entries
-- Safe to re-run: deletes existing rows first

DELETE FROM travel_entries;

INSERT INTO travel_entries (id, destination, from_date, to_date) VALUES
  ('2026-08-casablanca', 'Casablanca, Morocco', '2026-08-16', '2026-09-02'),
  ('2026-07-casablanca', 'Casablanca, Morocco', '2026-07-03', '2026-07-12'),
  ('2026-06-casablanca', 'Casablanca, Morocco', '2026-06-05', '2026-06-14'),
  ('2026-04-casablanca', 'Casablanca, Morocco', '2026-04-01', '2026-04-08'),
  ('2025-12-cabo-verde', 'Cabo Verde',          '2025-12-21', '2026-01-12'),
  ('2025-10-turkey',     'Turkey',               '2025-10-11', '2025-10-30');
