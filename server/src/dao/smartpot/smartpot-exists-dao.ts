import SmartPotModel from "../../models/SmartPot";
import mongoose from "mongoose";

async function smartpotExistsDao(serial_number: string) {
  const smartpot = await SmartPotModel.findOne({ serial_number });
  return !!smartpot;
}

// Nová funkce pro hledání podle active_flower_id
async function smartpotExistsByActiveFlowerIdDao(
  active_flower_id: string,
  excludeSerialNumber?: string
) {
  if (!active_flower_id) return false;
  const query: any = {
    active_flower_id: new mongoose.Types.ObjectId(active_flower_id),
  };
  if (excludeSerialNumber) {
    query.serial_number = { $ne: excludeSerialNumber };
  }
  const smartpot = await SmartPotModel.findOne(query);
  return !!smartpot;
}

export default smartpotExistsDao;
export { smartpotExistsByActiveFlowerIdDao };
