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
  departureTime: string;
  arrivalTime: string;
  operatingDays: 'daily' | 'weekdays' | 'weekends';
  ratePerKm: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchBusParams {
  origin: string;
  destination: string;
  date: string;
}
