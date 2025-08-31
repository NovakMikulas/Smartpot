import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { Types } from "mongoose";

import {
  sendError,
  sendClientError,
  sendSuccess,
  sendNotFound,
} from "../../middleware/response-handler";
import householdDecisionDao from "../../dao/household/household-decision-dao";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    decision: { type: "boolean" },
  },
  required: ["id", "decision"],
  additionalProperties: false,
};

async function householdDecisionAbl(
  data: Object,
  user_id: string,
  reply: FastifyReply
) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    const logged_user = new Types.ObjectId(user_id);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const household = await householdGetDao(String(data.id));
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }
    if (household?.members.some((member) => member._id.equals(logged_user))) {
      sendClientError(reply, "User is not member");
      return;
    }
    if (!household?.invites.some((invite) => invite._id.equals(logged_user))) {
      sendClientError(
        reply,
        "User that is logged in is not invited to the household"
      );
      return;
    }
    const updatedHousehold = await householdDecisionDao(
      String(data.id),
      String(logged_user),
      Boolean(data.decision)
    );
    sendSuccess(reply, updatedHousehold, "User decided successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdDecisionAbl;
