import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import scheduleUpdateDao from "../../dao/schedule/schedule-update-dao";
import { ISchedule } from "../../models/Schedule";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    active: { type: "boolean" },
    monday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    tuesday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    wednesday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    thursday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    friday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    saturday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
    sunday: {
      type: "object",
      properties: {
        from: { type: ["string", "null"] },
        to: { type: ["string", "null"] },
      },
    },
  },
  required: ["id"],
};
async function scheduleUpdateAbl(data: ISchedule, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    const validate_id = MongoValidator.validateId(data.id);
    if (!validate_id) {
      return sendClientError(reply, "Invalid schedule ID format");
    }
    const updatedSchedule = await scheduleUpdateDao(String(data.id), data);

    if (!updatedSchedule) {
      return sendNotFound(reply, "Schedule not found");
    }

    return sendSuccess(reply, updatedSchedule, "Schedule updated successfully");
  } catch (error) {
    return sendError(reply, "Failed to update schedule");
  }
}

export default scheduleUpdateAbl;
