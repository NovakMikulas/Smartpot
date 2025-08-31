import { Schema, model, Document, Types } from "mongoose";

export interface IHousehold extends Document {
  name: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  invites: Types.ObjectId[];
}

const HOUSEHOLD_SCHEMA = new Schema<IHousehold>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, required: true },
    members: { type: [Schema.Types.ObjectId], required: true },
    invites: { type: [Schema.Types.ObjectId], required: true },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const HOUSEHOLD_MODEL = model<IHousehold>("Household", HOUSEHOLD_SCHEMA);

export default HOUSEHOLD_MODEL;
