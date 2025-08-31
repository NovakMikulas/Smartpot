import { userConnections } from "./userConnections";

export function sendToUser(userId: string, data: any, wsType: string) {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    const payload = {
      wsType,
      timestamp: new Date().toISOString(),
      data,
    };
    ws.send(JSON.stringify(payload));
  } else {
    console.warn(`WebSocket not open for user ${userId}`);
  }
}

export function broadcastToAll(data: any, wsType: string) {
  userConnections.forEach((ws, userId) => {
    if (ws.readyState === ws.OPEN) {
      const payload = {
        wsType,
        timestamp: new Date().toISOString(),
        data,
      };
      ws.send(JSON.stringify(payload));
    } else {
      console.log(
        `WebSocket for user ID ${userId} is not open or does not exist.`
      );
    }
  });
}

export function sendToMultipleUsers(users: Array<any>, data: any, wsType: string) {
  users.forEach((user: any) => {
    if (user) sendToUser(user.id, data, wsType);
  });
}
