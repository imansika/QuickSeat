import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  bookingId: string;
  userId: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ userId: 1, paymentStatus: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true });

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
