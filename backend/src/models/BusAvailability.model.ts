import mongoose, { Document, Schema } from 'mongoose';

export interface IBusAvailability extends Document {
  busNumber: string;
  date: Date;
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusAvailabilitySchema = new Schema<IBusAvailability>(
  {
    busNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    availability: {
      type: Boolean,
      default: false,
      validate: {
        validator: (value: boolean) => value === false,
        message: 'availability must be false',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for busNumber and date to ensure uniqueness per date
BusAvailabilitySchema.index({ busNumber: 1, date: 1 }, { unique: true });

export const BusAvailability = mongoose.model<IBusAvailability>(
  'BusAvailability',
  BusAvailabilitySchema
);
