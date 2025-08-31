import { measurementController } from "../controller/measurement-controller";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth-middleware";
import { householdAuthMidlleware } from "../middleware/household-membership-middleware";

const MEMBER_ROLE = "member";
const OWNER_ROLE = "owner";

export default async function measurementRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/history",
    {
      onRequest: [authMiddleware],
    },
    measurementController.history
  );
  fastify.post("/create", measurementController.create);
  fastify.get(
    "/getLatest/:flowerId",
    {
      onRequest: [authMiddleware],
    },
    measurementController.getLatest
  );
}
