import { Schema, model, Document, Types } from "mongoose";

export interface IBatteryMeasurement extends Document {
    flower_id: Types.ObjectId;
    value: number;
}

const BATTERY_SCHEMA = new Schema<IBatteryMeasurement>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        value: { type: Number, required: false },

    },
    { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const BATTERY_MODEL = model<IBatteryMeasurement>("BatteryMeasurement", BATTERY_SCHEMA);

export default BATTERY_MODEL;
