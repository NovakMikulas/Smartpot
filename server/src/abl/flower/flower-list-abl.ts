import { FastifyRequest, FastifyReply } from "fastify";
import Ajv from "ajv";
import {
  sendClientError,
  sendSuccess,
  sendError,
} from "../../middleware/response-handler";
import listFlowers from "../../dao/flower/flower-list-dao";

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

async function flowerListAbl(request: FastifyRequest, reply: FastifyReply) {
  const page = Number((request.query as QueryParams).page);
  const household_id = (request.query as QueryParams).household_id;
  const limit = Number((request.query as QueryParams).limit);

  try {
    const validate = ajv.compile(schema);
    const valid = validate(request.query);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const flowers = await listFlowers(page, household_id, limit);
    sendSuccess(reply, flowers, "Flowers listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default flowerListAbl;
