import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import flowerProfileCreateDao from "../../dao/flowerProfile/flowerProfile-create-dao";

import { IFlowerProfile } from "../../models/FlowerProfile";
import {
  sendError,
  sendSuccess,
  sendClientError,
} from "../../middleware/response-handler";

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

  },
  required: ["temperature", "humidity", "light"],
  additionalProperties: false,
};

async function flowerProfileCreateAbl(
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
    const newFlowerProfile = await flowerProfileCreateDao(data);
    sendSuccess(
      reply,
      newFlowerProfile,
      "Flower profile assigned successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}

export default flowerProfileCreateAbl;
