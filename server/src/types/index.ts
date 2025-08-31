import { FastifyRequest, FastifyReply } from 'fastify';

export interface AppConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
}

export interface CustomRequest extends FastifyRequest {
  // Add custom properties here
}

export interface CustomReply extends FastifyReply {
  // Add custom properties here
} 