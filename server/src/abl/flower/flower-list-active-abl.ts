import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
} from "../../middleware/response-handler";
import listActiveFlowers from "../../dao/flower/flower-listActive-dao";
import Ajv from "ajv";
const ajv = new Ajv();
const schema = {
  type: "object",
  properties: {
    page: { type: "string" },
    household_id: { type: "string" },
    limit: { type: "string" },
  },
  required: ["page", "household_id", "limit"],
};

interface QueryParams {
  page: number;
  limit?: number;
  household_id: string;
}
async function flowerListActiveAbl(data: QueryParams, reply: FastifyReply) {
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
    const activeFlowers = await listActiveFlowers(
      data.page,
      data.household_id,
      data.limit
    );
    sendSuccess(reply, activeFlowers, "Active flowers retrieved successfully");
  } catch (error) {
    console.error("Error listing active flowers:", error);
    sendError(reply, "Failed to list active flowers");
  }
}

export default flowerListActiveAbl;
