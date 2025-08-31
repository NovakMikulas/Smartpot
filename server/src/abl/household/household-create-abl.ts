import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import householdCreateDao from "../../dao/household/household-create-dao";
import { IHousehold } from "../../models/Household";
import {
  sendError,
  sendSuccess,
  sendClientError,
} from "../../middleware/response-handler";
import { Types } from "mongoose";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    members: { type: "array", items: { type: "string" } },
    invites: { type: "array", items: { type: "string" } },
  },
  required: ["name"],
};

async function householdCreateAbl(
  data: IHousehold,
  user_id: string,
  reply: FastifyReply
) {
  try {
    data.members = data.members ?? [];
    data.invites = data.invites ?? [];
    data.owner = new Types.ObjectId(user_id);

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    const newHousehold = await householdCreateDao(data);
    sendSuccess(reply, newHousehold, "Household creates successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default householdCreateAbl;
