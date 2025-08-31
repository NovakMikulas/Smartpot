import { FastifyRequest, FastifyReply } from "fastify";
import smartpotCreateAbl from "../abl/smartpot/smartpot-create-abl";
import smartpotGetAbl from "../abl/smartpot/smartpot-get-abl";
import smartpotListByHouseholdAbl from "../abl/smartpot/smartpot-listByHousehold-abl";
import smartpotGetCurrentAbl from "../abl/smartpot/smartpot-getCurrentFlower-abl";
import { sendError } from "../middleware/response-handler";
import { ISmartPot } from "../models/SmartPot";
import smartpotUpdateAbl from "../abl/smartpot/smartPot-update-abl";
import smartpotTransplantAbl from "../abl/smartpot/smartpot-transplant-abl";

interface Params {
  id: string;
  household_id?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    user: {
      id: string;
    };
  };
}

export const smartpotController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISmartPot;
      await smartpotCreateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await smartpotGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  getCurrentFlower: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const serial_number = (request.params as Params).id;
      await smartpotGetCurrentAbl(serial_number, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISmartPot;
      await smartpotUpdateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  listByHousehold: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const household_id = (request.params as Params).id as string;
      await smartpotListByHouseholdAbl(household_id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  transplantSmartpotWithFlower: async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const data = request.body as any;
      const authRequest = request as AuthenticatedRequest;
      data.user_id = authRequest.user.user.id;
      await smartpotTransplantAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
