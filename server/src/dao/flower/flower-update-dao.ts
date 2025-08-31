import FlowerModel, { IFlower } from "../../models/Flower";

async function flowerUpdateDao(id: string, flowerData: any) {
  console.log("flowerData", flowerData.profile);
  const existingFlower = await FlowerModel.findById(id);
  if (!existingFlower) {
    return null;
  }
  const updatedFlower = await FlowerModel.findByIdAndUpdate(
    id,
    {
      $set: {
        name: flowerData.name,
        serial_number: flowerData.serial_number,
        household_id: flowerData.household_id,
        profile: flowerData.profile,
        avatar: flowerData.avatar,
      },
    },
    { new: true }
  );
  console.log("updatedFlower", updatedFlower);
  return updatedFlower;
}

export default flowerUpdateDao;
