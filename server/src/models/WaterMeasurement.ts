import { Schema, model, Document, Types } from "mongoose";

export interface IWaterMeasurement extends Document {
    flower_id: Types.ObjectId;
    value: string;
}

const WATER_SCHEMA = new Schema<IWaterMeasurement>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        value: {
            type: String,
            required: false,
            enum: ["low", "medium", "high"],
        },
    },
    { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const WATER_MODEL = model<IWaterMeasurement>("WaterMeasurement", WATER_SCHEMA);

export default WATER_MODEL;
