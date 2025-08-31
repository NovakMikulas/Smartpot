import { FastifyRequest, FastifyReply } from "fastify";
import scheduleGetFlowerScheduleDao from "../../dao/schedule/schedule-getFlowerSchedule-dao"; // Adjust the import based on your DAO structure
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";

async function getFlowerScheduleHandler(id: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, "Invalid schedule ID format");
    }

    const schedule = await scheduleGetFlowerScheduleDao(id);
    if (!schedule) {
      return sendNotFound(reply, "Schedule not found");
    }
    return sendSuccess(reply, schedule, "Schedule retrieved successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default getFlowerScheduleHandler;
