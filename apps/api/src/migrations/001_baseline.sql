-- Baseline: the schema production already has. Written idempotently so it
-- can be recorded on an existing database without touching its data.

CREATE TABLE IF NOT EXISTS notification_events (
  id         SERIAL PRIMARY KEY,
  event      TEXT        NOT NULL,
  user_agent TEXT,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW notification_events_by_device AS
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
