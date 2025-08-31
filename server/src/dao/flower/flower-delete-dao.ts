import FlowerModel from "../../models/Flower";

async function flowerDeleteDao(id: string) {
  const deletedFlower = await FlowerModel.findByIdAndDelete(id);
  return deletedFlower;
}

export default flowerDeleteDao;
