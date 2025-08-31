import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { Types } from "mongoose";

import {
  sendError,
  sendClientError,
  sendSuccess,
  //sendNoContent,
  sendNotFound,
} from "../../middleware/response-handler";
import kickHouseholdDao from "../../dao/household/household-kick-dao";
import householdGetDao from "../../dao/household/household-get-dao";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    kicked_user_id: { type: "string" },
  },
  required: ["id", "kicked_user_id"],
  additionalProperties: false,
};

async function householdKickAbl(data: Object, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
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
    const kickedUserObjectId = new Types.ObjectId(String(data.kicked_user_id));
    if (
      !household?.members.some((member) =>
        member._id.equals(kickedUserObjectId)
      )
    ) {
      sendClientError(reply, "User is not member");
      return;
    }
    const updatedHousehold = await kickHouseholdDao(
      String(data.id),
      String(data.kicked_user_id)
    );
    sendSuccess(reply, updatedHousehold, "User kicked successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdKickAbl;
