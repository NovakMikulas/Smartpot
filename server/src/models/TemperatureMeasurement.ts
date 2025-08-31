import { Schema, model, Document, Types } from "mongoose";

export interface ITemperatureMeasurement extends Document {
    flower_id: Types.ObjectId;
    value: number;
}

const TEMPERATURE_SCHEMA = new Schema<ITemperatureMeasurement>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        value: { type: Number, required: false },

    },
    { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const TEMPERATURE_MODEL = model<ITemperatureMeasurement>("temperatureMeasurement", TEMPERATURE_SCHEMA);

export default TEMPERATURE_MODEL;
