import { ISchedule } from "../../models/Schedule";
import ScheduleModel from "../../models/Schedule";

async function scheduleHasActiveDao(flower_id: string): Promise<boolean> {
  const activeSchedule = await ScheduleModel.findOne({
    flower_id,
    active: true,
  });
  return !!activeSchedule;
}

async function scheduleCreateDao(data: ISchedule) {
  // If this schedule is active, deactivate all other schedules for this flower
  if (data.active) {
    await ScheduleModel.updateMany(
      { flower_id: data.flower_id, active: true },
      { active: false }
    );
  }
  return await ScheduleModel.create(data);
}

export { scheduleCreateDao, scheduleHasActiveDao };
