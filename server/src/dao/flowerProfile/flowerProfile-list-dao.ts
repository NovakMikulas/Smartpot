import FLOWER_PROFILE_MODEL from "../../models/FlowerProfile";
async function flowerProfileGetDao() {
  return await FLOWER_PROFILE_MODEL.find();
}

export default flowerProfileGetDao;
