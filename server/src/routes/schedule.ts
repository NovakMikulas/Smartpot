import { scheduleController } from '../controller/schedule-controller';
import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth-middleware';

export default async function scheduleRoutes(fastify: FastifyInstance) {
    fastify.post('/create'/*,{ preHandler: authMiddleware }*/, scheduleController.create);
    fastify.get('/get/:id', scheduleController.get);
    fastify.put('/update', scheduleController.update);
}