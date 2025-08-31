import FLOWER_PROFILE_MODEL from "../../models/FlowerProfile";

async function flowerProfileDeleteDao(id: string) {
  return await FLOWER_PROFILE_MODEL.findByIdAndDelete(id);
}

export default flowerProfileDeleteDao;
