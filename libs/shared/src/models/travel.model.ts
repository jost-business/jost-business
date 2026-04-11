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
