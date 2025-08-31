import UserModel from "../../models/User";

async function userGetDao(id: string) {
  const user = await UserModel.findById(id);
  return user;
}

export default userGetDao;
