import { IncomingMessage } from "http";
import { Socket } from "net";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { secrets } from "../../config/config";

export function handleUpgrade(
  request: IncomingMessage,
  socket: any,
  head: Buffer,
  wss: WebSocketServer,
  fastify: any
) {
  try {
    const url = new URL(request.url ?? "", `http://${request.headers.host}`);
    if (url.pathname !== "/ws") return socket.destroy();

    const token = url.searchParams.get("token")?.trim();
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\nMissing token");
      return socket.destroy();
    }

    jwt.verify(token, secrets.JWT_SECRET, (err, decoded) => {
      if (
        err ||
        !decoded ||
        typeof decoded !== "object" ||
        !("user" in decoded) ||
        !(decoded as any).user?.id
      ) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\nInvalid token");
        return socket.destroy();
      }

      const user = (decoded as any).user;

      wss.handleUpgrade(request, socket, head, (ws) => {
        (ws as any).user = user;
        wss.emit("connection", ws, request);
      });
    });
  } catch (err) {
    fastify.log.error("WebSocket upgrade failed", err);
    socket.destroy();
  }
}
