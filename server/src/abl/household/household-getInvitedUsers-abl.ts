import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import householdGetInvitedUsersDao from "../../dao/household/household-getInvitedUsers-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function householdGetInvitedUsersAbl(
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
    const household = await householdGetInvitedUsersDao(household_id);
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }
    sendSuccess(
      reply,
      household,
      "Household invited users retrieved successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdGetInvitedUsersAbl;
