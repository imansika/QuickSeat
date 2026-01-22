import mongoose, { Document, Schema } from 'mongoose';

export interface IBusStop {
  name: string;
  location: string; // Address or coordinates
  arrivalTime?: string; // Optional time at this stop
}

export interface IBus extends Document {
  busNumber: string;
  routeNumber: string;
  operatorId: string; // Firebase UID of the operator who owns this bus
  origin: string;
  destination: string;
  stops: IBusStop[]; // Array of stops along the route
  seatCapacity: number;
  departureTime: string;
  arrivalTime: string;
  operatingDays: 'daily' | 'weekdays' | 'weekends';
  ratePerKm: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    routeNumber: {
      type: String,
      required: true,
      trim: true,
    },
    operatorId: {
      type: String,
      required: true,
      index: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    stops: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        location: {
          type: String,
          required: true,
          trim: true,
        },
        arrivalTime: {
          type: String,
          trim: true,
        },
      },
    ],
    seatCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    operatingDays: {
      type: String,
      enum: ['daily', 'weekdays', 'weekends'],
      default: 'daily',
    },
    ratePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BusSchema.index({ operatorId: 1, isActive: 1 });
BusSchema.index({ origin: 1, destination: 1 });

const Bus = mongoose.model<IBus>('Bus', BusSchema);

export default Bus;
