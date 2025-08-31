import HOUSEHOLD_MODEL from "../../models/Household";
import { Types } from "mongoose";

async function householdKickDao(id: string, kickedUser_id: string) {
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(
    id,
    {
      $pull: { members: new Types.ObjectId(kickedUser_id) },
    },
    { new: true }
  );
}

export default householdKickDao;
