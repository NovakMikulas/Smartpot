import { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    id: string;
    email?: string;
  };
}

export const userConnections: Map<string, AuthenticatedWebSocket> = new Map();
