import FlowerModel from "../../models/Flower";

async function flowerExistsDao(id: string) {
  const flower = await FlowerModel.findById(id);
  if (flower) {
    console.log("flower", flower);
    return true;
  }
  console.log("flower not found");
  return false;
}

export default flowerExistsDao;
