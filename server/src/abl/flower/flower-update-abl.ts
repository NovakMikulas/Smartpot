import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { IFlower } from "../../models/Flower";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import updateFlower from "../../dao/flower/flower-update-dao";
import smartpotGetBySerialNumberDao from "../../dao/smartpot/smartpot-getBySerial-dao";
import flowerGetDao from "../../dao/flower/flower-get-dao";
import updateSmartPot from "../../dao/smartpot/smartpot-update-dao";
import { ISmartPot } from "../../models/SmartPot";
const SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    //serial_number: { type: "string" },
    household_id: { type: "string" },
    profile: {
      type: "object",
      properties: {
        humidity: {
          type: "object",
          properties: {
            min: { type: "number" },
            max: { type: "number" },
          },
        },
        temperature: {
          type: "object",
          properties: {
            min: { type: "number" },
            max: { type: "number" },
          },
        },
        light: {
          type: "object",
          properties: {
            min: { type: "number" },
            max: { type: "number" },
          },
        },
      },
    },
  },
  required: ["id"],
  additionalProperties: true,
};

async function flowerUpdateAbl(data: IFlower, reply: FastifyReply) {
  try {
    const validate = ajv.compile(SCHEMA);
    const isValid = validate(data);
    if (!isValid) {
      console.log("Validation errors:", validate.errors);
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    const valid = MongoValidator.validateId(data.id);
    if (!valid) {
      return sendClientError(reply, "Invalid flower ID format");
    }

    /*  if (data.serial_number) {
      const doesSerialNumberExist = await smartpotGetBySerialNumberDao(
        data.serial_number
      );
      if (!doesSerialNumberExist) {
        sendClientError(
          reply,
          "Smart pot with pasted serial number does not exist"
        );
        return;
      }
    } */

    const old_flower = await flowerGetDao(data.id);
    if (!old_flower) {
      return sendNotFound(reply, "Flower not found");
    }

    // If household_id is not provided, use the existing one
    if (!data.household_id) {
      data.household_id = old_flower.household_id;
    }

    /*  const old_serial_number = old_flower.serial_number;
    const old_smart_pot = await smartpotGetBySerialNumberDao(
      String(old_serial_number)
    ); */

    /*  const new_smart_pot = data.serial_number
      ? await smartpotGetBySerialNumberDao(String(data.serial_number))
      : null;  */

    // Logic for when the flower is moved to a different smartpot
    /* if (
      old_smart_pot &&
      old_smart_pot.active_flower_id?.toString() ===
        old_flower._id?.toString() &&
      old_flower.serial_number === old_smart_pot.serial_number
    ) {
      const updateData = {
        serial_number: old_smart_pot.serial_number,
        active_flower_id: undefined,
        household_id: old_smart_pot.household_id,
      };
      await updateSmartPot(updateData as unknown as ISmartPot);
    } */

    // Validate household consistency
    if (
      //new_smart_pot?.household_id.toString() !==
      //old_flower?.household_id.toString() &&
      !data.household_id
    ) {
      sendClientError(
        reply,
        "Flower must be from the same household as the smartpot"
      );
      return;
    }

    /* if (
      //data.serial_number &&
      data.household_id
      // && new_smart_pot?.household_id.toString() !== data.household_id.toString()
    ) {
      sendClientError(
        reply,
        "Flower must be from the same household as the smartpot"
      );
      return;
    } */

    // Handle household change
    /*  if (data.household_id?.toString() !== old_flower.household_id?.toString()) {
      data.serial_number = "";
    } */

    const updatedFlower = await updateFlower(String(data.id), data);
    if (!updatedFlower) {
      return sendNotFound(reply, "Flower not found");
    }

    return sendSuccess(reply, updatedFlower, "Flower updated successfully");
  } catch (error) {
    console.error("Error updating flower:", error);
    return sendError(reply, "Failed to update flower");
  }
}

export default flowerUpdateAbl;
