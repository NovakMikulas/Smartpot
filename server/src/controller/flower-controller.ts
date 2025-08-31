import { FastifyRequest, FastifyReply } from "fastify";
import flowerCreateAbl from "../abl/flower/flower-create-abl";
import flowerUpdateAbl from "../abl/flower/flower-update-abl";
import flowerDeleteAbl from "../abl/flower/flower-delete-abl";
import flowerListAbl from "../abl/flower/flower-list-abl";
import flowerGetAbl from "../abl/flower/flower-get-abl";
import flowerGetScheduleAbl from "../abl/flower/flower-getSchedule-abl";

import { sendError } from "../middleware/response-handler";
import { IFlower } from "../models/Flower";
import listActiveFlowersHandler from "../abl/flower/flower-list-active-abl";

interface Params {
  id: string;
  serial_number?: string;
}

interface HistoryQuery {
  flower_id: string;
}

interface QueryParams {
  page: number;
  household_id: string;
  limit: number;
}

export const flowerController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IFlower;
      await flowerCreateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerDeleteAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await flowerListAbl(request, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IFlower;
      await flowerUpdateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },

  listActive: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.query as QueryParams;
      await listActiveFlowersHandler(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  getSchedule: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerGetScheduleAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
