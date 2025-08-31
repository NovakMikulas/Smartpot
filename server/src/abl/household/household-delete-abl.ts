import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendError,
  sendNoContent,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import householdDeleteDao from "../../dao/household/household-delete-dao";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function householdDeleteAbl(id: string, reply: FastifyReply) {
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

    await householdDeleteDao(id);
    sendNoContent(reply, "Household deleted successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdDeleteAbl;
