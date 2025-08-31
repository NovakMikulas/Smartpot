import { FastifyReply } from "fastify";
import Ajv from "ajv";
const ajv = new Ajv();
import smartpotListByHouseholdDao from "../../dao/smartpot/smartpot-listByHousehold-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};
async function smartpotListByHouseholdAbl(
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
    const filteredSmartpots = await smartpotListByHouseholdDao(household_id);
    if (!filteredSmartpots) {
      return sendNotFound(reply, "Smartpots not found");
    }
    const household = await householdGetDao(household_id);
    if (!household) {
      return sendNotFound(reply, "Household not found");
    }

    return sendSuccess(
      reply,
      filteredSmartpots,
      "Smartpots retrieved successfully"
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

export default smartpotListByHouseholdAbl;
