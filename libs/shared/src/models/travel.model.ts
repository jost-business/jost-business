export interface Trip {
  from: Date;
  to: Date;
  destination: string;
}

export interface TravelYear {
  year: number;
  trips: Trip[];
}
