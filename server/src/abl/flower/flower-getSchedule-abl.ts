import { FastifyReply } from "fastify";
import Ajv from "ajv";
const ajv = new Ajv();
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import getFlowerSchedule from "../../dao/flower/flower-getSchedule-dao";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function flowerGetScheduleAbl(id: string, reply: FastifyReply) {
  try {
    const idObject = { id: id };
    const validate = ajv.compile(schema);
    const valid = validate(idObject);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const flowerSchedule = await getFlowerSchedule(id);
    if (!flowerSchedule) {
      return sendNotFound(reply, "Flower schedule not found");
    }
    return sendSuccess(
      reply,
      flowerSchedule,
      "Flower schedule retrieved successfully"
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

export default flowerGetScheduleAbl;
