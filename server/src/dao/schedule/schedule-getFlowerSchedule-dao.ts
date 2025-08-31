import ScheduleModel from '../../models/Schedule';
import FlowerModel from '../../models/Flower';

async function getFlowerSchedule(id: string) {
    
    const flower = await FlowerModel.findById(id);
    if(!flower){
        return null;
    }
    const schedule = await ScheduleModel.findOne({flower_id: flower._id});
    return schedule;
}

export default getFlowerSchedule;
