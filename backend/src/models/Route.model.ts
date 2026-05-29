import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  routeNumber: string;
  stops: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    stops: {
      type: [String],
      required: true,
      validate: {
        validator: (stops: string[]) => Array.isArray(stops) && stops.length >= 2,
        message: 'A route must have at least two stops.',
      },
    },
  },
  {
    timestamps: true,
  }
);

RouteSchema.index({ routeNumber: 1 }, { unique: true });

const Route = mongoose.model<IRoute>('Route', RouteSchema);

export default Route;