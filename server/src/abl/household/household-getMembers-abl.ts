import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import householdGetMembersDao from "../../dao/household/household-getMembers-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function householdGetMembersAbl(
  household_id: string,
  reply: FastifyReply
) {
  try {
    const idObject = { id: household_id };
    const validate = ajv.compile(schema);
    const valid = validate(idObject);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const household = await householdGetMembersDao(household_id);
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }
    sendSuccess(reply, household, "Household users retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdGetMembersAbl;
