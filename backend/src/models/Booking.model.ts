import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string;
  userId: string;
  busNumber: string;
  seats: string[];
  journeyDate: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    busNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'At least one seat is required',
      },
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ busNumber: 1, journeyDate: 1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
