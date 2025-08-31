import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
} from "../../middleware/response-handler";
import householdListDao from "../../dao/household/household-list-dao";

const schema = {
  type: "object",
  properties: {
    user_id: { type: "string" },
  },
  required: ["user_id"],
  additionalProperties: false,
};

async function householdListAbl(user_id: string, reply: FastifyReply) {
  try {
    const idObject = { user_id: user_id };
    const validate = ajv.compile(schema);
    const valid = validate(idObject);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    const listHousehold = await householdListDao(user_id);
    sendSuccess(reply, listHousehold, "Households listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdListAbl;
