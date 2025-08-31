import { Schema, model, Document } from "mongoose";

interface IRange {
  min: number;
  max: number;
}

export interface IFlowerProfile extends Document {
  temperature: IRange;
  humidity: IRange;
  light: IRange;
}

const RANGE_SCHEMA = new Schema<IRange>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false }
);

const FLOWER_PROFILE_SCHEMA = new Schema<IFlowerProfile>(
  {
    temperature: { type: RANGE_SCHEMA, required: true },
    humidity: { type: RANGE_SCHEMA, required: true },
    light: { type: RANGE_SCHEMA, required: true },

  },
  { timestamps: true }
);

const FLOWER_PROFILE_MODEL = model<IFlowerProfile>(
  "FlowerProfile",
  FLOWER_PROFILE_SCHEMA
);

export default FLOWER_PROFILE_MODEL;
