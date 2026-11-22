-- The order of a trip's photo labels, as the gallery shows its sections.
-- Labels not in the list come after it, A to Z; names that are no longer a
-- label of the trip are simply skipped when reading.
ALTER TABLE trips ADD COLUMN label_order TEXT[] NOT NULL DEFAULT '{}';
