import HOUSEHOLD_MODEL from "../../models/Household";
import USER_MODEL from "../../models/User";

async function householdGetInvitedUsersDao(householdId: string) {
  const household = await HOUSEHOLD_MODEL.findById(householdId).lean();
  if (!household?.invites?.length) return [];

  const users = await USER_MODEL.find({ _id: { $in: household.invites } })
    .select("email")
    .lean();

  return users;
}

export default householdGetInvitedUsersDao;
