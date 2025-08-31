import SmartPotModel from "../../models/SmartPot";
import FlowerModel from "../../models/Flower";
import { Types } from "mongoose";

interface TransplantData {
  serial_number: string;
  household_id: string;
}

async function smartpotTransplantWithFlowerDao(data: TransplantData) {
  try {
    // Find SmartPot by serial number
    const smartPot = await SmartPotModel.findOne({
      serial_number: data.serial_number,
    });
    if (!smartPot) {
      throw new Error("SmartPot not found");
    }

    // Get the active flower ID
    const activeFlowerId = smartPot.active_flower_id;
    if (!activeFlowerId) {
      throw new Error("No active flower found in SmartPot");
    }

    // Update both SmartPot and Flower with new household_id
    const [updatedSmartPot, updatedFlower] = await Promise.all([
      SmartPotModel.findByIdAndUpdate(
        smartPot._id,
        { household_id: new Types.ObjectId(data.household_id) },
        { new: true }
      ),
      FlowerModel.findByIdAndUpdate(
        activeFlowerId,
        { household_id: new Types.ObjectId(data.household_id) },
        { new: true }
      ),
    ]);

    if (!updatedSmartPot || !updatedFlower) {
      throw new Error("Failed to update SmartPot or Flower");
    }

    return {
      smartPot: updatedSmartPot,
      flower: updatedFlower,
    };
  } catch (error) {
    throw error;
  }
}

export default smartpotTransplantWithFlowerDao;
