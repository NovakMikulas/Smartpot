import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { IHousehold } from "../../models/Household";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import householdUpdateDao from "../../dao/household/household-update-dao";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    members: { type: "array", items: { type: "string" } },
    invites: { type: "array", items: { type: "string" } },
  },
  required: ["id"],
  additionalProperties: false,
};

async function householdUpdateAbl(data: IHousehold, reply: FastifyReply) {
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
    const household = await householdGetDao(data.id);
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }

    const updatedHousehold = await householdUpdateDao(data.id as string, data);
    return sendSuccess(
      reply,
      updatedHousehold,
      "Household updated successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdUpdateAbl;
