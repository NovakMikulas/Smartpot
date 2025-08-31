import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import flowerProfileListDao from "../../dao/flowerProfile/flowerProfile-list-dao";

async function flowerProfileListAbl(reply: FastifyReply) {
  try {
    const listHousehold = await flowerProfileListDao();
    sendSuccess(reply, listHousehold, "Flower profiles listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileListAbl;
