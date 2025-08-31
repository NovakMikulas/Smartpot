import { FastifyReply } from "fastify";

export function sendResponse(
  reply: FastifyReply,
  statusCode: number,
  data: any,
  message: string
) 
{
  reply.status(statusCode).send({
    status: message,
    data: data,
  });
}

// 2xx Responses
export const sendSuccess = (
  reply: FastifyReply,
  data: any,
  message: string
) => {
  sendResponse(reply, 200, data, message);
};

export function sendCreated(reply: FastifyReply, data: any, message: string) {
  sendResponse(reply, 201, data, message);
}

export const sendNoContent = (
  reply: FastifyReply,
  message: string = "No content"
) => {
  sendResponse(reply, 204, null, message); // No content response
};

// Enhanced error handling function
export const sendError = (reply: FastifyReply, error: unknown) => {
  let statusCode = 500; // Default to Internal Server Error
  let message = "Unknown error occurred"; // Default error message
  if (error instanceof Error) {
    message = error.message; // Use the error message
    if (message.includes("not found")) {
      statusCode = 404; // Not Found
    } else if (message.includes("unauthorized")) {
      statusCode = 401; // Unauthorized
    } else if (message.includes("duplicate key error")) {
      statusCode = 409; // Conflict
    } else if (message.includes("validation failed")) {
      statusCode = 400; // Bad Request
    }
  }

  sendResponse(reply, statusCode, null, message);
  return;
};

// 4xx Responses
export const sendClientError = (
  reply: FastifyReply,
  message: string,
  code: number = 400
) => {
  sendResponse(reply, code, null, message);
};

// New function for 3xx responses
export const sendRedirect = (
  reply: FastifyReply,
  location: string,
  message: string = "Redirecting"
) => {
  reply.status(302).header("Location", location).send({
    message,
    status: "redirect",
  });
};

export const sendNotFound = (
  reply: FastifyReply,
  message: string = "Resource not found"
) => {
  sendClientError(reply, message, 404);
};

export const sendUnauthorized = (
  reply: FastifyReply,
  message: string = "Unauthorized access"
) => {
  sendClientError(reply, message, 401);
};

// 5xx Responses
export const sendInternalServerError = (
  reply: FastifyReply,
  message: string = "Internal server error"
) => {
  sendResponse(reply, 500, null, message);
};

export const sendServiceUnavailable = (
  reply: FastifyReply,
  message: string = "Service unavailable"
) => {
  sendResponse(reply, 503, null, message);
};

export const sendGatewayTimeout = (
  reply: FastifyReply,
  message: string = "Gateway timeout"
) => {
  sendResponse(reply, 504, null, message);
};
