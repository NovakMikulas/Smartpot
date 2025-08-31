import HOUSEHOLD_MODEL from "../../models/Household";
async function householdGetDao(id: string) {
  return await HOUSEHOLD_MODEL.findById(id);
}

export default householdGetDao;
