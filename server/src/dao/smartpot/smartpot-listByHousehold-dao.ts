import SmartPotModel from "../../models/SmartPot";

async function smartpotlistByHouseholdDao(householdId: string) {
  return await SmartPotModel.find({ household_id: householdId });
}

export default smartpotlistByHouseholdDao;
