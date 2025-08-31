import ScheduleModel from '../../models/Schedule'

async function updateFlowerSchedule(flowerId: string, data: any) {
  try {
    const updatedSchedule = await ScheduleModel.findOneAndUpdate(
      { flower_id: flowerId },
      {
        $set: {
          active: data.active,
          monday: data.monday,
          tuesday: data.tuesday,
          wednesday: data.wednesday,
          thursday: data.thursday,
          friday: data.friday,
          saturday: data.saturday,
          sunday: data.sunday,
        },
      },
      { new: true }
    )

    return updatedSchedule
  } catch (error) {
    console.error('Error updating flower schedule:', error)
    throw error
  }
}

export default updateFlowerSchedule
