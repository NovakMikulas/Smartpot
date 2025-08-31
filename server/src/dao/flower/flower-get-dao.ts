import FlowerModel from "../../models/Flower";
import SmartPotModel from "../../models/SmartPot";

async function flowerGetDao(id: string) {
  const flower = await FlowerModel.findById(id);
  if (!flower) return null;

  const smartpot = await SmartPotModel.findOne({ active_flower_id: id });

  return {
    ...flower.toObject(),
    serial_number: smartpot ? smartpot.serial_number : null,
  };
}

export default flowerGetDao;
