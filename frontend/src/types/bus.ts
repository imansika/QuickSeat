export interface BusStop {
  name: string;
  location: string;
  arrivalTime?: string;
}

export interface Bus {
  _id: string;
  busNumber: string;
  routeNumber: string;
  operatorId: string;
  origin: string;
  destination: string;
  stops: BusStop[];
  seatCapacity: number;
  layoutType: '2x2' | '1x2' | '2x1' | '1x3' | '3x1';
  departureTime: string;
  arrivalTime: string;
  operatingDays: 'daily' | 'weekdays' | 'weekends';
  ratePerKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchBusParams {
  origin: string;
  destination: string;
  date: string;
}
