import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";

async function householdUpdateDao(id: string, data: IHousehold) {
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(id, data, {
    new: true,
  });
}
export default householdUpdateDao;
