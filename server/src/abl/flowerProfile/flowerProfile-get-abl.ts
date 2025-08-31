import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
} from "../../middleware/response-handler";
import flowerProfileGetDao from "../../dao/flowerProfile/flowerProfile-get-dao";

const schema = {
  type: "object",
  properties: {
    flowerProfile_id: { type: "string" },
  },
  required: ["flowerProfile_id"],
  additionalProperties: false,
};

async function flowerProfileGetAbl(id: string, reply: FastifyReply) {
  try {
    const idObject = { flowerProfile_id: id };
    const validate = ajv.compile(schema);
    const valid = validate(idObject);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const flowerProfile = await flowerProfileGetDao(id);
    if (!flowerProfile) {
      sendClientError(reply, "Flower profile does not exist");
      return;
    }
    sendSuccess(reply, flowerProfile, "Flower profile retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileGetAbl;
