-- Labels on trip photos, like the hotel a photo was taken at. Labels belong to
-- a trip: a label exists as long as one of the trip's photos has it.
--
-- The photos themselves are an array on trips, so a row cannot point at one
-- with a foreign key. Reading only counts rows whose photo is still in the
-- trip's array, and deleting a photo removes its rows as well.
CREATE TABLE photo_labels (
  trip_id TEXT NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  photo   TEXT NOT NULL,
  label   TEXT NOT NULL,
  PRIMARY KEY (trip_id, photo, label)
);
