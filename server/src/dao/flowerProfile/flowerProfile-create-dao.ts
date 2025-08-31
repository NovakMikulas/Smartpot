import FLOWER_PROFILE_MODEL from "../../models/FlowerProfile";
import { IFlowerProfile } from "../../models/FlowerProfile";
async function flowerProfileCreateDao(data: IFlowerProfile) {
  return await FLOWER_PROFILE_MODEL.create(data);
}
export default flowerProfileCreateDao;
