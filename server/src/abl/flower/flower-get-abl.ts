import { FastifyReply } from "fastify";

import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import getFlower from "../../dao/flower/flower-get-dao";

async function flowerGetAbl(id: string, reply: FastifyReply) {
  try {
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, "Invalid flower ID format");
    }
    const flower = await getFlower(id);
    if (!flower) {
      return sendNotFound(reply, "Flower not found");
    }
    return sendSuccess(reply, flower, "Flower retrieved successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default flowerGetAbl;
