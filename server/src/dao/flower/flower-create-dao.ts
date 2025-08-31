import FlowerModel, { IFlower } from "../../models/Flower";

async function flowerCreateDao(data: IFlower) {
  const flower = new FlowerModel(data);
  return await flower.save();
}

export default flowerCreateDao;
