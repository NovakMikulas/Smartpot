import { Schema, model, Document, Types } from "mongoose";

export interface IFlower extends Document {
  profile_id: string;
  name: string;
  household_id: Types.ObjectId;
  //serial_number: string;
  avatar: string;
  profile: {
    humidity: {
      min: number | null;
      max: number | null;
    };
    temperature: {
      min: number | null;
      max: number | null;
    };
    light: {
      min: number | null;
      max: number | null;
    };
  };
}

const flowerSchema = new Schema<IFlower>(
  {
    name: { type: String, required: true },
    household_id: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: false,
    },
    avatar: { type: String, required: false, default: null },
    //serial_number: { type: String, required: false, default: null },
    profile: {
      humidity: {
        min: { type: Number, required: false, default: null },
        max: { type: Number, required: false, default: null },
      },
      temperature: {
        min: { type: Number, required: false, default: null },
        max: { type: Number, required: false, default: null },
      },
      light: {
        min: { type: Number, required: false, default: null },
        max: { type: Number, required: false, default: null },
      },
      water_level: {
        min: { type: Number, required: false, default: null },
      },
    },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const FlowerModel = model<IFlower>("Flower", flowerSchema);

export default FlowerModel;
