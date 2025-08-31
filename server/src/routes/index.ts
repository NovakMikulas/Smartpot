import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import flowerRoutes from "./flower"; // Import the flower routes
import householdRoutes from "./household"; // Import the household routes
import smartpotRoutes from "./smartPot"; // Import the smartpot routes
import scheduleRoutes from "./schedule"; // Import the schedule routes
import flowerProfileRoutes from "./flowerProfile"; // Import the household routes
import measurementRoutes from "./measurement";
import userRoutes from "./user";

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Register routes under the /api prefix
  fastify.register(flowerRoutes, { prefix: "/flower" });
  fastify.register(householdRoutes, { prefix: "/household" });
  fastify.register(smartpotRoutes, { prefix: "/smart-pot" });
  fastify.register(scheduleRoutes, { prefix: "/schedule" });
  fastify.register(flowerProfileRoutes, { prefix: "/flowerProfile" });
  fastify.register(measurementRoutes, { prefix: "/measurement" });
  fastify.register(userRoutes, { prefix: "/user" });
};

export default routes;
