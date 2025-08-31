import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function householdGetAbl(id: string, reply: FastifyReply) {
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
    const household = await householdGetDao(id);
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }
    sendSuccess(reply, household, "Household retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdGetAbl;
