import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);

import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import measurementHistoryDao from "../../dao/measurement/measurement-history-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    typeOfData: {
      type: "string",
      enum: ["humidity", "water", "temperature", "light" , "battery"]
    },
    dateFrom: { type: "string", format: "date" },
    dateTo: { type: "string", format: "date" },
  },
  required: ["id", "typeOfData"],
  additionalProperties: false,
};

async function measurementHistoryAbl(data: Object, reply: FastifyReply) {
  try {
    console.log(data);
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const history = await measurementHistoryDao(data);
    if (!history) {
      sendNotFound(reply, "History does not exist");
    }
    sendSuccess(reply, history, "Flower history retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default measurementHistoryAbl;
