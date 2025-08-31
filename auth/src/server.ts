import { FastifyInstance } from "fastify";
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { connectToDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env") });
//console.log(process.env.JWT_SECRET);
const server: FastifyInstance = fastify({ logger: true });

// Register plugins
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "your-secret-key",
});

server.register(fastifyCors, {
  origin: true, // allow all origins for now, configure according to your needs
});

// Register routes
server.register(authRoutes);

// JWT verification middleware
server.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start the server
    await server.listen({
      port: /* Number(process.env.PORT) ||  */3003,
      host: "0.0.0.0",
    });
    server.log.info(`Server is running on port ${/* process.env.PORT || */ 3003}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
