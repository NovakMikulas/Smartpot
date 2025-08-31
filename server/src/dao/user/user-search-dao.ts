import USER_MODEL from "../../models/User";

async function userSearchDao(query: string) {
  return await USER_MODEL.find({
    $or: [
      { email: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
      { surname: { $regex: query, $options: "i" } },
    ],
  })
    .select("email name surname")
    .lean();
}

export default userSearchDao;
