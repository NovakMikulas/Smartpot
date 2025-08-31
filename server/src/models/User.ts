import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  surname: string;
  email: string;
  password: string;
}

const USER_SCHEMA = new Schema<IUser>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const USER_MODEL = model<IUser>("User", USER_SCHEMA);

export default USER_MODEL;
