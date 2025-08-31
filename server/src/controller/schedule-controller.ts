import { FastifyRequest, FastifyReply } from "fastify";
import scheduleCreateAbl from "../abl/schedule/schedule-create-abl";
import scheduleGetAbl from "../abl/schedule/schedule-get-abl";
import scheduleUpdateAbl from "../abl/schedule/schedule-update-abl";
import { sendError } from "../middleware/response-handler";
import { ISchedule } from "../models/Schedule";

interface Params {
  id: string;
}
export const scheduleController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISchedule;
      await scheduleCreateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await scheduleGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await scheduleUpdateAbl(request.body as ISchedule, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
