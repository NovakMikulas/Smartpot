import HOUSEHOLD_MODEL from "../../models/Household";

async function householdLeaveDao(householdId: string, userId: string) {
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(
    householdId,
    { $pull: { members: userId } },
    { new: true }
  );
}

export default householdLeaveDao;
