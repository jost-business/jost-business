export interface Trip {
  id: string;
  from: Date;
  to: Date;
  destination: string;
  photos: Photo[];
  /** The order of the photo labels' sections; labels not in it come after, A to Z. */
  labelOrder: string[];
}

/** A trip photo, served by the API. */
export interface Photo {
  /** The file name, which the API uses to delete it. */
  name: string;
  url: string;
  /** Labels the user gave it, like the hotel it was taken at; sorted. */
  labels: string[];
}

/**
 * A trip as the API sends it over the wire (GET /trips). JSON has no date
 * type, so the instants arrive as ISO 8601 strings and the frontend turns
 * them into a Trip.
 */
export interface TripDto {
  id: string;
  destination: string;
  startsAt: string;
  endsAt: string;
  photos: string[];
  /** Photo name → its labels; photos without labels are left out. */
  photoLabels: Record<string, string[]>;
  /** The order of the photo labels' sections. */
  labelOrder: string[];
}

/**
 * Body of PATCH /trips/:id/photo-labels: gives the label to the photos in add
 * and takes it off the photos in remove.
 */
export interface PhotoLabelChange {
  label: string;
  add?: string[];
  remove?: string[];
}

/** Body of PUT /trips/:id. The id is fixed once a trip exists. */
export interface TripInput {
  destination: string;
  startsAt: string;
  endsAt: string;
}

/** Body of POST /trips. */
export interface NewTripRequest extends TripInput {
  id: string;
}

/** GET /trips/availability?id=…: whether a new trip may use this id. */
export interface TripIdAvailability {
  available: boolean;
}
