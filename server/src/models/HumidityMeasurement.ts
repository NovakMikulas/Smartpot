import { Schema, model, Document, Types } from "mongoose";

export interface IHumidityMeasurement extends Document {
    flower_id: Types.ObjectId;
    value: number;
}

const HUMIDITY_SCHEMA = new Schema<IHumidityMeasurement>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        value: { type: Number, required: false },

    },
    { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const HUMIDITY_MODEL = model<IHumidityMeasurement>("HumidityMeasurement", HUMIDITY_SCHEMA);

export default HUMIDITY_MODEL;
