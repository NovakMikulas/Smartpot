import FLOWER_PROFILE_MODEL from "../../models/FlowerProfile";
async function flowerProfileGetDao(id: string) {
  return await FLOWER_PROFILE_MODEL.findById(id);
}

export default flowerProfileGetDao;
