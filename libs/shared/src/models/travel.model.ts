export interface Trip {
  id: string;
  from: Date;
  to: Date;
  destination: string;
  photos: string[];
}

export interface TravelYear {
  year: number;
  trips: Trip[];
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
}
