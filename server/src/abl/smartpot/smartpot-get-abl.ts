import { FastifyReply } from "fastify";
import smartpotGetDao from "../../dao/smartpot/smartpot-get-dao"; // Adjust the import based on your DAO structure
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";

async function smartpotGetAbl(id: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, "Invalid smartpot ID format");
    }

    const smartpot = await smartpotGetDao(id);
    if (!smartpot) {
      return sendNotFound(reply, "SmartPot not found");
    }
    return sendSuccess(reply, smartpot, "SmartPot retrieved successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default smartpotGetAbl;
