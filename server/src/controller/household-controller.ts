import { FastifyRequest, FastifyReply } from "fastify";
import householdCreateAbl from "../abl/household/household-create-abl";
import householdDeleteAbl from "../abl/household/household-delete-abl";
import householdGetAbl from "../abl/household/household-get-abl";
import householdListAbl from "../abl/household/household-list-abl";
import householdUpdateAbl from "../abl/household/household-update-abl";
import householdInviteAbl from "../abl/household/household-invite-abl";
import householdKickAbl from "../abl/household/household-kick-abl";
import householdChangeOwnerAbl from "../abl/household/household-changeOwner-abl";
import householdDecisionAbl from "../abl/household/household-decision-abl";
import householdLeaveAbl from "../abl/household/household-leave-abl";
import householdGetMembersAbl from "../abl/household/household-getMembers-abl";
import householdGetInvitedUsersAbl from "../abl/household/household-getInvitedUsers-abl";

import { sendError } from "../middleware/response-handler";
import { IHousehold } from "../models/Household";

interface Params {
  id: string;
  user_id?: string;
  invited_user_id?: string;
  kicked_user_id?: string;
  new_owner_id?: string;
}

export const householdController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IHousehold;
      const user_id = (request.user as { user?: { id?: string } })?.user
        ?.id as string;
      await householdCreateAbl(reqParam, user_id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await householdDeleteAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await householdGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user_id = (request.user as { user?: { id?: string } })?.user?.id;
      await householdListAbl(String(user_id), reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as IHousehold;
      await householdUpdateAbl(updatedHousehold, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  invite: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const invite = request.body as Params;
      await householdInviteAbl(invite, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  kick: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const kick = request.body as Params;
      await householdKickAbl(kick, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  changeOwner: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const newOwner = request.body as Params;
      await householdChangeOwnerAbl(newOwner, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  decision: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as Params;
      const user_id = (request.user as { user?: { id?: string } })?.user
        ?.id as string;

      await householdDecisionAbl(updatedHousehold, user_id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  leave: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const household = request.body as Params;
      const household_id = household.id;
      const user_id = (request.user as { user?: { id?: string } })?.user
        ?.id as string;

      await householdLeaveAbl(household_id, user_id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  getMembers: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await householdGetMembersAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  getInvitedUsers: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await householdGetInvitedUsersAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
