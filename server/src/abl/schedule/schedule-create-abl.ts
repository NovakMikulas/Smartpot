import { FastifyReply } from "fastify";
import {
  scheduleCreateDao,
  scheduleHasActiveDao,
} from "../../dao/schedule/schedule-create-dao";
import { ISchedule } from "../../models/Schedule";
import {
  sendClientError,
  sendCreated,
  sendError,
} from "../../middleware/response-handler";
import checkFlowerExists from "../../dao/flower/flower-exists-dao";
import {
  validateCreateSchedule,
  formatValidationErrors,
} from "../../validation/schedule-validation";
import Ajv from "ajv";
const ajv = new Ajv();
const schema = {
  type: "object",
  properties: {
    flower_id: { type: "string" },
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
  required: ["flower_id"],
};

async function scheduleCreateAbl(data: ISchedule, reply: FastifyReply) {
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

    const flower = await checkFlowerExists(data.flower_id.toString());
    if (!flower) {
      return sendClientError(reply, "Flower not found");
    }

    // If trying to create an active schedule, check if one already exists
    if (data.active) {
      const hasActive = await scheduleHasActiveDao(data.flower_id.toString());
      if (hasActive) {
        return sendClientError(
          reply,
          "This flower already has an active schedule. Please deactivate it first."
        );
      }
    }

    const createdSchedule = await scheduleCreateDao(data);
    return sendCreated(reply, createdSchedule, "Schedule created successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default scheduleCreateAbl;
