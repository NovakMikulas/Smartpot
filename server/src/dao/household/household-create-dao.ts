import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";
async function householdCreateDao(data: IHousehold) {
  return await HOUSEHOLD_MODEL.create(data);
}
export default householdCreateDao;
