-- Trips move from the hardcoded TravelService into the database.
--
-- travel_entries only ever held a partial seed with day precision and was
-- never read by any frontend, so it is replaced rather than migrated.
DROP TABLE IF EXISTS travel_entries;

CREATE TABLE trips (
  id          TEXT        PRIMARY KEY,
  destination TEXT        NOT NULL,
  -- Flight times matter for the countdown, so these are instants, not days
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  photos      TEXT[]      NOT NULL DEFAULT '{}',
  CONSTRAINT trips_ends_after_start CHECK (ends_at > starts_at)
);

CREATE INDEX trips_starts_at_idx ON trips (starts_at);

-- One-time import of the trips that used to live in the code. The times were
-- written as Swiss local time, so they are interpreted in Europe/Zurich.
INSERT INTO trips (id, destination, starts_at, ends_at, photos) VALUES
  ('2026-12-casablanca', 'Casablanca, Morocco', '2026-12-23 12:15 Europe/Zurich', '2027-01-06 07:05 Europe/Zurich', '{}'),
  ('2026-11-casablanca', 'Casablanca, Morocco', '2026-11-25 14:00 Europe/Zurich', '2026-12-02 08:10 Europe/Zurich', '{}'),
  ('2026-10-casablanca', 'Casablanca, Morocco', '2026-10-16 15:05 Europe/Zurich', '2026-10-25 08:40 Europe/Zurich', '{}'),
  ('2026-08-casablanca', 'Casablanca, Morocco', '2026-08-16 16:05 Europe/Zurich', '2026-09-02 08:40 Europe/Zurich', '{}'),
  ('2026-07-casablanca', 'Casablanca, Morocco', '2026-07-03 16:05 Europe/Zurich', '2026-07-12 08:40 Europe/Zurich', '{}'),
  ('2026-06-casablanca', 'Casablanca, Morocco', '2026-06-05 16:05 Europe/Zurich', '2026-06-14 08:40 Europe/Zurich', '{}'),
  ('2026-04-casablanca', 'Casablanca, Morocco', '2026-04-01 00:00 Europe/Zurich', '2026-04-08 00:00 Europe/Zurich', '{}'),
  ('2025-12-cabo-verde', 'Cabo Verde',          '2025-12-21 00:00 Europe/Zurich', '2026-01-12 00:00 Europe/Zurich', '{}'),
  ('2025-10-turkey',     'Turkey',              '2025-10-11 00:00 Europe/Zurich', '2025-10-30 00:00 Europe/Zurich', ARRAY[
    'alanya_love.jpeg', 'hera-hotel.jpeg', 'hera-pool.jpeg', 'alanya.jpeg',
    'alanya_cable_car.jpeg', 'black_party.jpeg', 'coast.jpeg', 'dinner.jpeg',
    'kiss.jpeg', 'land_of_legends_castle.jpeg', 'laugh.jpeg', 'pure_fear.jpeg',
    'robinson_black_party.jpeg', 'robinson_swing.jpeg', 'shoes.jpeg',
    'suluada-island.jpeg', 'suluada-swim.jpeg', 'tschiggi.jpeg', 'view.jpeg',
    'white_party.jpeg'
  ]),
  ('2025-03-dakla',      'Dakhla',              '2025-03-22 00:00 Europe/Zurich', '2025-04-23 00:00 Europe/Zurich', '{}');
