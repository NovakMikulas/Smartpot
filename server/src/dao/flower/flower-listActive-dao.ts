import FlowerModel from "../../models/Flower";
import SmartPotModel from "../../models/SmartPot";
import mongoose from "mongoose";

async function flowerListActiveDao(
  page: number = 1,
  household_id: string,
  limit: number = 10
) {
  // Ensure page and limit are numbers
  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

  // First get the total count of active flowers for this household
  const totalActive = await SmartPotModel.countDocuments({
    household_id: new mongoose.Types.ObjectId(household_id),
    active_flower_id: { $exists: true, $ne: null },
  });

  // Get paginated active flowers using aggregation
  const activeFlowers = await SmartPotModel.aggregate([
    // Match smartpots with active flowers in this household
    {
      $match: {
        household_id: new mongoose.Types.ObjectId(household_id),
        active_flower_id: { $exists: true, $ne: null },
      },
    },
    // Skip and limit for pagination
    {
      $skip: (parsedPage - 1) * parsedLimit,
    },
    {
      $limit: parsedLimit,
    },
    // Lookup to get the flower details
    {
      $lookup: {
        from: "flowers",
        localField: "active_flower_id",
        foreignField: "_id",
        as: "flower",
      },
    },
    // Unwind the flower array (converts array to object)
    {
      $unwind: "$flower",
    },
    // Project only the flower fields we need
    {
      $project: {
        _id: "$flower._id",
        name: "$flower.name",
        profile_id: "$flower.profile_id",
        household_id: "$flower.household_id",
        serial_number: "$serial_number",
        createdAt: "$flower.createdAt",
        updatedAt: "$flower.updatedAt",
      },
    },
  ]);

  return {
    itemList: activeFlowers,
    pageInfo: {
      total: totalActive,
      page: parsedPage,
      limit: parsedLimit,
    },
  };
}

export default flowerListActiveDao;
