import ScheduleModel from "../../models/Schedule";

async function scheduleGetDao(id: string) {
  const schedule = await ScheduleModel.findById(id);
  return schedule;
}

export default scheduleGetDao;
