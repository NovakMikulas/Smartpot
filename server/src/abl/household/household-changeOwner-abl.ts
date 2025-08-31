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
import householdChangeOwnerDao from "../../dao/household/household-changeOwner-dao";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    new_owner_id: { type: "string" },
  },
  required: ["id", "new_owner_id"],
  additionalProperties: false,
};

async function householdChangeOwnerAbl(data: Object, reply: FastifyReply) {
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
      return;
    }

    const newOwnerObjectId = new Types.ObjectId(String(data.new_owner_id));
    if (
      !household?.members.some((member) => member._id.equals(newOwnerObjectId))
    ) {
      sendClientError(reply, "New owner is not a member");
      return;
    }

    const updatedHousehold = await householdChangeOwnerDao(
      String(data.id),
      String(data.new_owner_id)
    );

    sendSuccess(reply, updatedHousehold, "Owner changed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default householdChangeOwnerAbl;
