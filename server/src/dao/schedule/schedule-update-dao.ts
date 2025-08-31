import ScheduleModel, { ISchedule } from "../../models/Schedule";

async function scheduleUpdateDao(id: string, scheduleData: ISchedule) {
  const existingSchedule = await ScheduleModel.findById(id);
  if (!existingSchedule) {
    return null;
  }
  const updatedSchedule = await ScheduleModel.findByIdAndUpdate(
    id,
    {
      $set: {
        active: scheduleData.active,
        monday: scheduleData.monday,
        tuesday: scheduleData.tuesday,
        wednesday: scheduleData.wednesday,
        thursday: scheduleData.thursday,
        friday: scheduleData.friday,
        saturday: scheduleData.saturday,
        sunday: scheduleData.sunday,
      },
    },
    { new: true }
  );
  return updatedSchedule;
}

export default scheduleUpdateDao;
