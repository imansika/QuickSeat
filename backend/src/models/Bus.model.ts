import mongoose, { Document, Schema } from 'mongoose';

export interface IBusStop {
  name: string;
  location: string; 
  
}

export interface IBus extends Document {
  busNumber: string;
  routeNumber: string;
  origin: string;
  destination: string;
  stops: IBusStop[]; 
  seatCapacity: number;
  layoutType: '2x2' | '1x2' | '2x1' | '1x3' | '3x1';
  departureTime: string;
  operatingDays: 'daily' | 'weekdays' | 'weekends';
  ratePerKm: number;
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
    layoutType: {
      type: String,
      enum: ['2x2', '1x2', '2x1', '1x3', '3x1'],
      required: true,
      default: '2x2',
    },
    departureTime: {
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
    
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BusSchema.index({ origin: 1, destination: 1 });

const Bus = mongoose.model<IBus>('Bus', BusSchema);

export default Bus;
