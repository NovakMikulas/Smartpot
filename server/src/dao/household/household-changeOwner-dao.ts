import { Types } from "mongoose";
import HOUSEHOLD_MODEL from "../../models/Household";
import householdGetDao from "./household-get-dao";

async function householdChangeOwnerDao(id: string, newOwner_id: string) {
  const household = await householdGetDao(id);
  if (!household) throw new Error("Household not found");

  const oldOwner_id = household.owner.toString();

  await HOUSEHOLD_MODEL.findByIdAndUpdate(id, {
    $set: { owner: new Types.ObjectId(newOwner_id) },
    $addToSet: { members: new Types.ObjectId(oldOwner_id) },
  });

  await HOUSEHOLD_MODEL.findByIdAndUpdate(id, {
    $pull: { members: new Types.ObjectId(newOwner_id) },
  });

  return await householdGetDao(id);
}

export default householdChangeOwnerDao;
