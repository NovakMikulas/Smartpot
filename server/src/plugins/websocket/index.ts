import { FastifyInstance } from "fastify";
import { WebSocketServer } from "ws";
import { handleUpgrade } from "./upgrade";
import { handleConnection } from "./connection";

export const websocketPlugin = async (fastify: FastifyInstance) => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", handleConnection(fastify));

  fastify.server.on("upgrade", (req, socket, head) => {
    handleUpgrade(req, socket, head, wss, fastify);
  });

  fastify.get("/ws", (_, reply) => {
    reply.send({
      message: "WebSocket server is running and requires token authentication",
    });
  });
};
