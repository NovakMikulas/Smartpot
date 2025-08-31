import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import smartpotUpdateDao from "../../dao/smartpot/smartpot-update-dao";
import { ISmartPot } from "../../models/SmartPot";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import checkFlowerExists from "../../dao/flower/flower-exists-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import mongoose from "mongoose";
import flowerGetDao from "../../dao/flower/flower-get-dao";
import getSmartBySerialNumberPot from "../../dao/smartpot/smartpot-getBySerial-dao";
import { smartpotExistsByActiveFlowerIdDao } from "../../dao/smartpot/smartpot-exists-dao";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const schema = {
  type: "object",
  properties: {
    serial_number: { type: "string" },
    active_flower_id: { type: "string", nullable: true },
    household_id: { type: "string" },
  },
  required: ["serial_number"],
};

// Add this type to handle the update data
interface SmartPotUpdateData {
  serial_number: string;
  household_id?: mongoose.Types.ObjectId;
  active_flower_id?: mongoose.Types.ObjectId | null;
}

async function smartpotUpdateAbl(data: ISmartPot, reply: FastifyReply) {
  try {
    // Get existing smartpot data
    const existingSmartPot = await getSmartBySerialNumberPot(
      data.serial_number
    );
    if (!existingSmartPot) {
      sendNotFound(reply, "SmartPot not found");
      return;
    }

    // Create update data object with correct types
    const updateData: SmartPotUpdateData = {
      serial_number: data.serial_number,
    };

    if (data.household_id) {
      updateData.household_id = new mongoose.Types.ObjectId(
        data.household_id.toString()
      );
    }

    if (data.active_flower_id) {
      updateData.active_flower_id = new mongoose.Types.ObjectId(
        data.active_flower_id.toString()
      );
    }

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    // Validate IDs format
    if (
      data.active_flower_id &&
      !isValidObjectId(data.active_flower_id.toString())
    ) {
      sendClientError(reply, "Invalid active_flower_id format");
      return;
    }

    if (data.household_id && !isValidObjectId(data.household_id.toString())) {
      sendClientError(reply, "Invalid household_id format");
      return;
    }

    // Validate household if provided
    if (updateData.household_id) {
      const existsHousehold = await householdGetDao(
        updateData.household_id.toString()
      );
      if (!existsHousehold) {
        console.log("Household not found");
        sendNotFound(reply, "Household not found");
        return;
      }

      // Check if household has changed
      if (
        existingSmartPot.household_id?.toString() !==
        updateData.household_id.toString()
      ) {
        console.log("Household changed, removing active flower");
        updateData.active_flower_id = null;
      }
    }

    // Validate active flower if provided
    if (updateData.active_flower_id) {
      const existsFlower = await checkFlowerExists(
        updateData.active_flower_id.toString()
      );
      if (!existsFlower) {
        sendNotFound(reply, "Active flower not found");
        return;
      }

      // Check if flower is from the same household
      const flower = await flowerGetDao(updateData.active_flower_id.toString());
      if (
        flower &&
        updateData.household_id &&
        flower.household_id.toString() !== updateData.household_id.toString()
      ) {
        console.log("Flower is not from the same household");
        sendClientError(
          reply,
          "Flower must be from the same household as the smartpot"
        );
        return;
      }

      // Nová validace: jestli už není přiřazena v jiném smartpotu
      const alreadyAssigned = await smartpotExistsByActiveFlowerIdDao(
        updateData.active_flower_id.toString(),
        updateData.serial_number
      );
      if (alreadyAssigned) {
        sendClientError(
          reply,
          "This flower is already assigned to another smartpot"
        );
        return;
      }
    }

    // Update the smartpot with properly typed data
    const updatedSmartPot = await smartpotUpdateDao(updateData as ISmartPot);
    if (!updatedSmartPot) {
      sendNotFound(reply, "SmartPot not found");
      return;
    }

    // Send success response
    sendSuccess(reply, updatedSmartPot, "SmartPot updated successfully");
  } catch (error) {
    console.error("Error updating smartpot:", error);
    sendError(reply, error);
  }
}

export default smartpotUpdateAbl;
