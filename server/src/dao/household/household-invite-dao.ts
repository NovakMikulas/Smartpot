import HOUSEHOLD_MODEL from "../../models/Household";
import { Types } from "mongoose";

async function householdInviteDao(id: string, invitedUser_id: string) {
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(
    id,
    { $addToSet: { invites: new Types.ObjectId(invitedUser_id) } },
    { new: true }
  );
}

export default householdInviteDao;
