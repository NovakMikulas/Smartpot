import { FastifyRequest, FastifyReply } from "fastify";
import flowerProfileCreateAbl from "../abl/flowerProfile/flowerProfile-create-abl";
import flowerProfileDeleteAbl from "../abl/flowerProfile/flowerProfile-delete-abl";
import flowerProfileGetAbl from "../abl/flowerProfile/flowerProfile-get-abl";
import flowerProfileListAbl from "../abl/flowerProfile/flowerProfile-list-abl";
import flowerProfileUpdateAbl from "../abl/flowerProfile/flowerProfile-update-abl";
import { sendError } from "../middleware/response-handler";
import { IFlowerProfile } from "../models/FlowerProfile";

interface Params {
  id: string;
}

export const flowerProfileController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IFlowerProfile;
      await flowerProfileCreateAbl(reqParam, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await flowerProfileDeleteAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerProfileGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await flowerProfileListAbl(reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedFlowerProfile = request.body as IFlowerProfile;
      await flowerProfileUpdateAbl(updatedFlowerProfile, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
