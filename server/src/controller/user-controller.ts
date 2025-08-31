import { FastifyRequest, FastifyReply } from "fastify";

import userSearchAbl from "../abl/user/user-search-abl";
import userInvites from "../abl/user/user-invites-abl";

import { sendError } from "../middleware/response-handler";

interface Params {
  id: string;
  query?: string;
}

export const userController = {
  search: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = (request.query as Params).query!;
      await userSearchAbl(query, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  invites: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user_id = (request.user as { user?: { id?: string } })?.user?.id;
      await userInvites(String(user_id), reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
