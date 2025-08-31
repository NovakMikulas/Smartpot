import HOUSEHOLD_MODEL from "../../models/Household";
import { Types } from "mongoose";

async function householdDecisionDao(
  id: string,
  invitedUser_id: string,
  decision: boolean
) {
  if (decision) {
    return await HOUSEHOLD_MODEL.findByIdAndUpdate(
      id,
      {
        $addToSet: { members: new Types.ObjectId(invitedUser_id) },
        $pull: { invites: new Types.ObjectId(invitedUser_id) },
      },
      { new: true }
    );
  } else {
    return await HOUSEHOLD_MODEL.findByIdAndUpdate(
      id,
      { $pull: { invites: new Types.ObjectId(invitedUser_id) } },
      { new: true }
    );
  }
}

export default householdDecisionDao;
