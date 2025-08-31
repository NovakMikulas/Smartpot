import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import measurementGetLatestDao from "../../dao/measurement/measurement-getLatest-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function measurementGetLatestAbl(flower_id: string, reply: FastifyReply) {
  try {
    const idObject = { id: flower_id };
    const validate = ajv.compile(schema);
    const valid = validate(idObject);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const measurements = await measurementGetLatestDao(flower_id);
    if (!measurements) {
      sendNotFound(reply, "Flower does not have measurements");
    }
    sendSuccess(reply, measurements, "Measurements retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default measurementGetLatestAbl;
