import WaterMeasurementModel from '../../models/WaterMeasurement';
import HumidityMeasurementModel from '../../models/HumidityMeasurement';
import LightMeasurementModel from '../../models/LightMeasurement';
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement';
import BatteryMeasurementModel from '../../models/BatteryMeasurement';

const measurementModelMap: Record<string, any> = {
  water: WaterMeasurementModel,
  light: LightMeasurementModel,
  humidity: HumidityMeasurementModel,
  temperature: TemperatureMeasurementModel,
  battery: BatteryMeasurementModel,
};

async function measurementHistoryDao(data: any) {
  const Model = measurementModelMap[data.typeOfData];

  const query: any = {
    flower_id: data.id,
  };

  if (data.dateFrom && data.dateTo) {
    query.createdAt = {
      $gte: new Date(data.dateFrom),
      $lte: new Date(new Date(data.dateTo).setHours(23, 59, 59, 999)),
    };
  }

  const records = await Model.find(query)
    .sort({ createdAt: -1 }) // Most recent first
    .limit(!data.dateFrom && !data.dateTo ? 100 : 0) // Only limit if no dates provided
    .lean();

  // If sorted descending, reverse to get oldest first
  return records.reverse();
}

export default measurementHistoryDao;
