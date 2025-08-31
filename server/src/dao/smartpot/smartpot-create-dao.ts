import { ISmartPot } from "../../models/SmartPot";
import SmartPotModel from "../../models/SmartPot";

async function smartpotCreateDao(data: ISmartPot) {
  return await SmartPotModel.create(data);
}

export default smartpotCreateDao;
