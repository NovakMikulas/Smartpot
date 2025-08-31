import { FastifyReply } from "fastify";
import smartpotGetDao from "../../dao/smartpot/smartpot-getBySerial-dao";
import flowerGetDao from "../../dao/flower/flower-get-dao";
import { Types } from "mongoose";

import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../../middleware/response-handler";

async function smartpotGetCurrentFlowerAbl(
  serial_number: string,
  reply: FastifyReply
) {
  try {
    const smartpot = await smartpotGetDao(serial_number);
    if (!smartpot) {
      return sendNotFound(reply, "Smartpot not found");
    }
    if (!smartpot.active_flower_id) {
      return sendNotFound(reply, "No active flower linked to this smartpot");
    }
    const activeFlowerId = new Types.ObjectId(
      String(smartpot.active_flower_id)
    );
    const flower = await flowerGetDao(String(activeFlowerId));
    return sendSuccess(reply, flower, "Current flower retrieved successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default smartpotGetCurrentFlowerAbl;
