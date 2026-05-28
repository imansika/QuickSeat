import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  bookingId: string;
  email: string;
  busNumber: string;
  journeyDate: Date;
  departureTime: string;
  seatNumber: string;
  amount: number;
  qrCode: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bookingId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    busNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 16,
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
      trim: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    qrCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'CANCELLED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ bookingId: 1, seatNumber: 1 }, { unique: true });
TicketSchema.index({ email: 1, journeyDate: 1 });

const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;