import { FastifyRequest, FastifyReply } from 'fastify';

// Extend FastifyRequest to include a user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: { };
  }
}
import fetch from 'node-fetch';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  console.log('Auth middleware called');
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'Missing Authorization header' }); // Return explicitly
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return reply.code(401).send({ error: 'Invalid Authorization header format' }); // Return explicitly
  }

  try {
    const authServerUrl = process.env.AUTH_SERVER_URL || 'http://localhost:3000';
    if (!authServerUrl) {
      throw new Error('AUTH_SERVER_URL environment variable is not set');
    }

    const response = await fetch(`${authServerUrl}/auth/check`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return reply.code(401).send({ error: 'Unauthorized' }); // Return explicitly
    }

    const data = await response.json() as { user: any; authorized: boolean };

    if (!data.authorized) {
      return reply.code(401).send({ error: 'Unauthorized' }); // Return explicitly
    }

    request.user = data.user; // Store user object directly
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return reply.code(500).send({ error: 'Internal Server Error' }); // Return explicitly
  }
}
