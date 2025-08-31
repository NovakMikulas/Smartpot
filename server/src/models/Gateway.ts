import { Schema, model, Document } from "mongoose";

interface IConnectedDevice {
  deviceId: string;
  status: "active" | "inactive";
  lastUpdate: Date;
}

export interface IGateway extends Document {
  serialNumber: string;
  idHousehold: string;
  status: "online" | "offline";
  lastSync: Date;
  connectedDevices: IConnectedDevice[];
}

const CONNECTED_DEVICE_SCHEMA = new Schema<IConnectedDevice>({
  deviceId: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  lastUpdate: { type: Date, required: true },
});

const GATEWAY_SCHEMA = new Schema<IGateway>(
  {
    serialNumber: { type: String, required: true },
    idHousehold: { type: String, required: true },
    status: { type: String, enum: ["online", "offline"], required: true },
    lastSync: { type: Date, required: true },
    connectedDevices: { type: [CONNECTED_DEVICE_SCHEMA], default: [] },
  },
  { timestamps: true }
);

const GATEWAY_MODEL = model<IGateway>("Gateway", GATEWAY_SCHEMA);

export default GATEWAY_MODEL;
