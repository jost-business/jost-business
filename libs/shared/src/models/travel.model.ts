export interface Trip {
  id: string;
  from: Date;
  to: Date;
  destination: string;
}

export interface TravelYear {
  year: number;
  trips: Trip[];
}
