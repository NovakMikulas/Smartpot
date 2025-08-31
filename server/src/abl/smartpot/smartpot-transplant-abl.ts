import smartpotGetBySerialDao from "../../dao/smartpot/smartpot-getBySerial-dao";
import {
  sendClientError,
  sendError,
  sendNotFound,
} from "../../middleware/response-handler";
import Ajv from "ajv";
import { FastifyReply } from "fastify";
const ajv = new Ajv();
import mongoose from "mongoose";
import householdGetDao from "../../dao/household/household-get-dao";
import flowerGetDao from "../../dao/flower/flower-get-dao";
import { sendSuccess } from "../../middleware/response-handler";
import smartpotTransplantWithFlowerDao from "../../dao/smartpot/smartpot-transplant-with-flower-dao";
import { ISmartPot } from "../../models/SmartPot";
import { IFlower } from "../../models/Flower";
import { IHousehold } from "../../models/Household";

const schema = {
  type: "object",
  properties: {
    serial_number: { type: "string" },
    household_id: { type: "string" },
    user_id: { type: "string" },
  },
  required: ["serial_number", "household_id", "user_id"],
};

interface SmartPotTransplantData {
  serial_number: string;
  household_id: string;
  user_id: string;
}

async function smartpotTransplantAbl(
  data: SmartPotTransplantData,
  reply: FastifyReply
) {
  try {
    console.log("[DEBUG] Received data:", data);
    if (!data.user_id) {
      console.log("[DEBUG] User ID is missing in request data");
      return sendClientError(reply, "User ID is required");
    }

    console.log("[DEBUG] Starting transplant ABL with data:", {
      serial_number: data.serial_number,
      household_id: data.household_id,
      user_id: data.user_id,
    });

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      console.log(
        "[DEBUG] Validation failed:",
        JSON.stringify(validate.errors)
      );
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    console.log("[DEBUG] Input validation successful");

    //kontrola existance smartpotu
    console.log(
      "[DEBUG] Checking SmartPot existence for serial:",
      data.serial_number
    );
    const existingSmartPot = await smartpotGetBySerialDao(data.serial_number);
    if (!existingSmartPot) {
      console.log("[DEBUG] SmartPot not found for serial:", data.serial_number);
      sendNotFound(reply, "SmartPot not found");
      return;
    }
    console.log("[DEBUG] Found existing SmartPot:", {
      id: existingSmartPot._id?.toString(),
      household_id: existingSmartPot.household_id?.toString(),
      active_flower_id: existingSmartPot.active_flower_id?.toString(),
    });

    //kontrola existance householdu
    let existsHousehold: IHousehold | null = null;
    if (data.household_id) {
      console.log(
        "[DEBUG] Checking household existence for ID:",
        data.household_id
      );
      existsHousehold = await householdGetDao(data.household_id);
      if (!existsHousehold) {
        console.log("[DEBUG] Household not found for ID:", data.household_id);
        sendNotFound(reply, "Household not found");
        return;
      }
      console.log("[DEBUG] Found household:", {
        id: existsHousehold._id?.toString(),
        owner: existsHousehold.owner?.toString(),
      });

      //overeni jestli smartpot bude v household, kde je user owner
      if (existsHousehold.owner?.toString() !== data.user_id) {
        console.log("[DEBUG] User is not owner of target household:", {
          user_id: data.user_id,
          household_owner: existsHousehold.owner?.toString(),
        });
        sendClientError(reply, "You are not the owner of this smartpot");
        return;
      }
    }

    //overeni jestli smartpot patří do hhousehold, kde je user owner
    if (existingSmartPot.household_id) {
      console.log("[DEBUG] Checking current household permissions");
      const household = await householdGetDao(
        existingSmartPot.household_id.toString()
      );
      if (
        household &&
        household.owner?.toString() !== data.household_id &&
        household.members?.includes(new mongoose.Types.ObjectId(data.user_id))
      ) {
        console.log("[DEBUG] User has insufficient permissions:", {
          user_id: data.user_id,
          household_owner: household.owner?.toString(),
          is_member: household.members?.includes(
            new mongoose.Types.ObjectId(data.user_id)
          ),
        });
        sendClientError(
          reply,
          "You are not the owner or member of this smartpot"
        );
        return;
      }
    }

    //kontrola jestli je flower asssignutá ve stejném householdu jako smartpot
    if (existingSmartPot.active_flower_id) {
      console.log("[DEBUG] Checking flower household assignment");
      const flower = await flowerGetDao(
        existingSmartPot.active_flower_id.toString()
      );
      /* if (
        flower &&
        existsHousehold &&
        flower.household_id?.toString() !== existsHousehold._id?.toString()
      ) {
        console.log("[DEBUG] Flower household mismatch:", {
          flower_household: flower.household_id?.toString(),
          target_household: existsHousehold._id?.toString(),
        });
        sendClientError(
          reply,
          "Flower is not in the same household as smartpot."
        );
        return;
      } */
    }

    //smart nemá aktivní flower
    if (!existingSmartPot.active_flower_id) {
      console.log("[DEBUG] No active flower found in SmartPot");
      sendClientError(reply, "Smartpot is not assigned to any flower.");
      return;
    }

    console.log("[DEBUG] All validations passed, proceeding with transplant");
    const updateSmartpot = await smartpotTransplantWithFlowerDao(data);
    console.log("[DEBUG] Transplant completed successfully:", {
      smartpot_id: updateSmartpot.smartPot._id?.toString(),
      flower_id: updateSmartpot.flower._id?.toString(),
    });

    return sendSuccess(
      reply,
      updateSmartpot,
      "Smartpot with flower transplanted successfully"
    );
  } catch (error) {
    console.log("[DEBUG] Error in transplant ABL:", error);
    return sendError(reply, error);
  }
}

export default smartpotTransplantAbl;
