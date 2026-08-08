-- Drop and recreate all tables (safe to re-run)

DROP VIEW  IF EXISTS notification_events_by_device;
DROP TABLE IF EXISTS notification_events;
DROP TABLE IF EXISTS travel_entries;

-- PWA app-open events logged by the API
CREATE TABLE notification_events (
  id         SERIAL PRIMARY KEY,
  event      TEXT        NOT NULL,
  user_agent TEXT,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Travel entries (future: migrate from TravelService hardcoded data)
CREATE TABLE travel_entries (
  id          TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL
);

-- Device summary view for notification_events
CREATE VIEW notification_events_by_device AS
SELECT
  CASE
    WHEN user_agent LIKE '%iPhone%' AND user_agent LIKE '%CriOS%'  THEN 'iPhone – Chrome'
    WHEN user_agent LIKE '%iPhone%'                                  THEN 'iPhone – Safari'
    WHEN user_agent LIKE '%Linux; Android%'                         THEN 'Galaxy – Chrome'
    WHEN user_agent LIKE '%Windows%'                                 THEN 'Windows – Chrome'
    ELSE 'Other'
  END              AS device,
  CASE
    WHEN user_agent LIKE '%Linux; Android%'                         THEN 'Mina'
    ELSE 'Jost'
  END              AS person,
  COUNT(*)         AS visits,
  MIN(timestamp)   AS first_visit,
  MAX(timestamp)   AS last_visit
FROM notification_events
GROUP BY device, person
ORDER BY visits DESC;
