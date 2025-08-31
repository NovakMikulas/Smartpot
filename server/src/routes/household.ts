import { FastifyInstance } from "fastify";
import { householdController } from "../controller/household-controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { householdAuthMidlleware } from "../middleware/household-membership-middleware";

const MEMBER_ROLE = "member";
const OWNER_ROLE = "owner";

export default async function householdRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/create",
    { onRequest: authMiddleware },
    householdController.create
  );
  fastify.delete(
    "/delete",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.delete
  );
  fastify.get(
    "/get/:id",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    householdController.get
  );
  fastify.put(
    "/update",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.update
  );
  fastify.get(
    "/list",
    {
      onRequest: [authMiddleware], // Then check household auth
    },
    householdController.list
  );
  fastify.post(
    "/invite",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.invite
  );
  fastify.put(
    "/kick",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.kick
  );
  fastify.put(
    "/changeOwner",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE])], // Then check household auth
    },
    householdController.changeOwner
  );
  fastify.put(
    "/decision",
    {
      onRequest: [authMiddleware], // Authenticate first
    },
    householdController.decision
  );
  fastify.put(
    "/leave",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([MEMBER_ROLE])], // Then check household auth
    },
    householdController.leave
  );
  fastify.get(
    "/getMembers/:id",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    householdController.getMembers
  );
  fastify.get(
    "/getInvited/:id",
    {
      onRequest: [authMiddleware], // Authenticate first
      preHandler: [householdAuthMidlleware([OWNER_ROLE, MEMBER_ROLE])], // Then check household auth
    },
    householdController.getInvitedUsers
  );
}
