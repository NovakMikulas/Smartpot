import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
} from "../../middleware/response-handler";
import flowerProfileUpdateDao from "../../dao/flowerProfile/flowerProfile-update-dao";
import flowerProfileGetDao from "../../dao/flowerProfile/flowerProfile-get-dao";

import { IFlowerProfile } from "@/models/FlowerProfile";

const schema = {
  type: "object",
  properties: {
    temperature: {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },
    humidity: {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },
    light: {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },

    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function flowerProfileUpdateAbl(
  data: IFlowerProfile,
  reply: FastifyReply
) {
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

    const flowerProfile = await flowerProfileGetDao(data.id);
    if (!flowerProfile) {
      sendClientError(reply, "Flower profile does not exist");
      return;
    }
    const updatedFlowerProfile = await flowerProfileUpdateDao(
      data.id as string,
      data
    );
    return sendSuccess(
      reply,
      updatedFlowerProfile,
      "Flower profile updated successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileUpdateAbl;
