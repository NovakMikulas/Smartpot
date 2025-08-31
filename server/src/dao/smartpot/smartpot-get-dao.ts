import SmartPotModel from "../../models/SmartPot";

async function smartpotGetDao(id: string) {
  const smartpot = await SmartPotModel.findById(id);
  return smartpot;
}

export default smartpotGetDao;
