import FLOWER_PROFILE_MODEL from "../../models/FlowerProfile";
import { IFlowerProfile } from "../../models/FlowerProfile";

async function flowerProfileUpdateDao(id: string, data: IFlowerProfile) {
  return await FLOWER_PROFILE_MODEL.findByIdAndUpdate(id, data, {
    new: true,
  });
}
export default flowerProfileUpdateDao;
