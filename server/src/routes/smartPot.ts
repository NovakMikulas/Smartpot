import { smartpotController } from "../controller/smartPot-controller";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth-middleware";
import { householdAuthMidlleware } from "../middleware/household-membership-middleware";

const MEMBER_ROLE = "member";
const OWNER_ROLE = "owner";

export default async function smartpotRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/create",
    {
      onRequest: [authMiddleware], // Administrator při výrobě
    },
    smartpotController.create
  );
  fastify.get(
    "/get/:id",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    smartpotController.get
  );
  fastify.get(
    "/getCurrentFlower/:id",
    /*
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    */
    smartpotController.getCurrentFlower
  );
  fastify.put(
    "/update",
    {
      onRequest: [authMiddleware], // Authenticate first
      //preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    smartpotController.update
  );
  fastify.get(
    "/listByHousehold/:id",
    {
      onRequest: [authMiddleware], // Authenticate first
    },
    smartpotController.listByHousehold
  );
  fastify.post(
    "/transplant-smartpot-with-flower",
    {
      onRequest: [authMiddleware],
      preHandler: [householdAuthMidlleware([OWNER_ROLE])],
    },
    smartpotController.transplantSmartpotWithFlower
  );
}
