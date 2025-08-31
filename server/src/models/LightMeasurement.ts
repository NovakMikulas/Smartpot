import { Schema, model, Document, Types } from "mongoose";

export interface ILightMeasurement extends Document {
    flower_id: Types.ObjectId;
    value: number;
}

const LIGHT_SCHEMA = new Schema<ILightMeasurement>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        value: { type: Number, required: false },

    },
    { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const LIGHT_MODEL = model<ILightMeasurement>("lightMeasurement", LIGHT_SCHEMA);

export default LIGHT_MODEL;
