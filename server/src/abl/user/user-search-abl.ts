import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import userSearchDao from "../../dao/user/user-search-dao";

const schema = {
  type: "object",
  properties: {
    query: { type: "string" },
  },
  required: ["query"],
  additionalProperties: false,
};

async function userSearchAbl(query: string, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate({ query });
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const users = await userSearchDao(query);
    if (!users) {
      sendNotFound(reply, "No users found");
    }
    sendSuccess(reply, users, "Users retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default userSearchAbl;
