import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { Types } from "mongoose";
import {
  sendError,
  sendClientError,
  sendSuccess,
} from "../../middleware/response-handler";
import householdInviteDao from "../../dao/household/household-invite-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import { sendToUser } from "../../plugins/websocket/sender";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    invited_user_id: { type: "string" },
  },
  required: ["id", "invited_user_id"],
  additionalProperties: false,
};

async function householdInviteAbl(data: Object, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const household = await householdGetDao(String(data.id));
    if (!household) {
      sendClientError(reply, "Household does not exist");
    }
    const invitedUserObjectId = new Types.ObjectId(
      String(data.invited_user_id)
    );

    if (
      household?.members.some((member) =>
        member._id.equals(invitedUserObjectId)
      )
    ) {
      sendClientError(reply, "User already member");
      return;
    }

    if (
      household?.invites.some((invite) =>
        invite._id.equals(invitedUserObjectId)
      )
    ) {
      sendClientError(reply, "User already invited");
      return;
    }

    if (household?.owner.equals(invitedUserObjectId)) {
      sendClientError(reply, "User is already the owner of the household");
      return;
    }

    const updatedHousehold = await householdInviteDao(
      String(data.id),
      String(data.invited_user_id)
    );

    sendToUser(String(data.invited_user_id), updatedHousehold, "invite");
    sendSuccess(reply, updatedHousehold, "User invited successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdInviteAbl;
