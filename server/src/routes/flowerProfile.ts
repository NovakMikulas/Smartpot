import { FastifyInstance } from "fastify";
import { flowerProfileController } from "../controller/flowerProfile-controller";
import { authMiddleware } from "../middleware/auth-middleware";

export default async function flowerProfileRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/create",
    { onRequest: authMiddleware },
    flowerProfileController.create
  );
  fastify.get(
    "/list",
    { onRequest: authMiddleware },
    flowerProfileController.list
  );
  fastify.delete(
    "/delete",
    { onRequest: authMiddleware },
    flowerProfileController.delete
  );
  fastify.get(
    "/get/:id",
    { onRequest: authMiddleware },
    flowerProfileController.get
  );
  fastify.put(
    "/update",
    { onRequest: authMiddleware },
    flowerProfileController.update
  );
}
