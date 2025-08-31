import WaterMeasurementModel from "../../models/WaterMeasurement";
import HumidityMeasurementModel from "../../models/HumidityMeasurement";
import LightMeasurementModel from "../../models/LightMeasurement";
import TemperatureMeasurementModel from "../../models/TemperatureMeasurement";
import BatteryMeasurementModel from "../../models/BatteryMeasurement";

const measurementModelMap: Record<string, any> = {
  water: WaterMeasurementModel,
  light: LightMeasurementModel,
  soil: HumidityMeasurementModel,
  temperature: TemperatureMeasurementModel,
  battery: BatteryMeasurementModel,
};

async function measurementCreateDao(data: any) {
  const Model = measurementModelMap[data.typeOfData];

  if (!Model) {
    throw new Error(`Unsupported measurement type: ${data.typeOfData}`);
  }

  return await Model.create(data);
}

export default measurementCreateDao;
