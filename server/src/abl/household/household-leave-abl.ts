import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import householdLeaveDao from "../../dao/household/household-leave-dao";
import householdGetDao from "../../dao/household/household-get-dao";

import {
  sendError,
  sendSuccess,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
};

async function householdLeaveAbl(
  household_id: string,
  user_id: string,
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
    const household = await householdGetDao(household_id);
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }

    const updatedHousehold = await householdLeaveDao(household_id, user_id);
    sendSuccess(reply, updatedHousehold, "User left household successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default householdLeaveAbl;
