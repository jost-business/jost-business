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

export interface TravelEntry {
  id: string;
  destination: string;
  from_date: string;
  to_date: string;
}
