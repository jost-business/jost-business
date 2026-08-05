-- Drop and recreate all tables (safe to re-run)

DROP TABLE IF EXISTS notification_events;
DROP TABLE IF EXISTS travel_entries;

-- PWA app-open events logged by the API
CREATE TABLE notification_events (
  id        SERIAL PRIMARY KEY,
  event     TEXT        NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Travel entries (future: migrate from TravelService hardcoded data)
CREATE TABLE travel_entries (
  id          TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL
);
