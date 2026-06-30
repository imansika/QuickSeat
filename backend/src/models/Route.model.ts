import mongoose, { Document, Schema } from "mongoose";

interface ISegmentFare {
  from: string;
  to: string;
  fare: number;
}

export interface IRoute extends Document {
  routeNumber: string;
  stops: string[];
  segmentFares: ISegmentFare[];
  createdAt: Date;
  updatedAt: Date;
}

const SegmentFareSchema = new Schema<ISegmentFare>(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

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
        validator: (stops: string[]) =>
          Array.isArray(stops) && stops.length >= 2,
        message: "A route must have at least two stops.",
      },
    },
    segmentFares: {
      type: [SegmentFareSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

RouteSchema.index({ routeNumber: 1 }, { unique: true });

const Route = mongoose.model<IRoute>("Route", RouteSchema);

export default Route;
