import { FastifyInstance } from "fastify";
import { AuthenticatedWebSocket, userConnections } from "./userConnections";

export function handleConnection(fastify: FastifyInstance) {
  return (ws: AuthenticatedWebSocket) => {
    const user = ws.user;
    if (!user || !user.id) {
      ws.close(4001, "Unauthorized");
      return;
    }

    fastify.log.info(`WebSocket connected: ${user.id}`);
    userConnections.set(user.id, ws);

    ws.send(JSON.stringify({ message: `Welcome ${user.id || "User"}!` }));

    ws.on("message", (message) => {
      fastify.log.info(`Message from ${user.id}: ${message}`);
      ws.send(JSON.stringify({ echo: message.toString() }));
    });

    ws.on("close", () => {
      fastify.log.info(`Disconnected: ${user.id}`);
      userConnections.delete(user.id);
    });
  };
}
