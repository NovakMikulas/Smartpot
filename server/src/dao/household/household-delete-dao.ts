import HOUSEHOLD_MODEL from "../../models/Household";

async function householdDeleteDao(id: string) {
  return await HOUSEHOLD_MODEL.findByIdAndDelete(id);
}

export default householdDeleteDao;
