import FlowerModel from "../../models/Flower";
import mongoose from "mongoose";

async function listFlowers(
  page: number = 1,
  household_id: string,
  limit: number = 10
) {
  // Ensure page and limit are numbers
  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

  const match = { household_id: new mongoose.Types.ObjectId(household_id) };

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "smartpots",
        localField: "_id",
        foreignField: "active_flower_id",
        as: "smartpot",
      },
    },
    {
      $unwind: {
        path: "$smartpot",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        serial_number: "$smartpot.serial_number",
      },
    },
    {
      $project: {
        smartpot: 0,
      },
    },
    { $skip: (parsedPage - 1) * parsedLimit },
    { $limit: parsedLimit },
  ];

  const flowers = await FlowerModel.aggregate(pipeline);
  const total = await FlowerModel.countDocuments(match);

  return {
    itemList: flowers,
    pageInfo: {
      total,
      page: parsedPage,
      limit: parsedLimit,
    },
  };
}

export default listFlowers;
