import { Schema, model, Document, Types } from "mongoose";

export interface ISmartPot extends Document {
    serial_number: string;
    household_id: Types.ObjectId;
    active_flower_id: Types.ObjectId;
}

const smartpotSchema = new Schema<ISmartPot>(
  {
        serial_number: { type: String, required: true ,unique:true},
        household_id: { type: Schema.Types.ObjectId, ref: "Household", required: false,default:null },
        active_flower_id: { type: Schema.Types.ObjectId , ref: "Flower", required: false,default:null },
  },
  { timestamps: true ,}
); // Adds `createdAt` & `updatedAt` fields

const SmartPotModel = model<ISmartPot>("SmartPot", smartpotSchema);

export default SmartPotModel;
