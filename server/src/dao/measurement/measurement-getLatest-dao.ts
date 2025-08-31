import BatteryMeasurement from "../../models/BatteryMeasurement";
import HumidityMeasurement from "../../models/HumidityMeasurement";
import LightMeasurement from "../../models/LightMeasurement";
import TemperatureMeasurement from "../../models/TemperatureMeasurement";
import WaterMeasurement from "../../models/WaterMeasurement";

async function measurementGetLatestDao(flowerId: string) {
  const [battery, humidity, light, temperature, water] = await Promise.all([
    BatteryMeasurement.findOne({ flower_id: flowerId }).sort({ createdAt: -1 }),
    HumidityMeasurement.findOne({ flower_id: flowerId }).sort({
      createdAt: -1,
    }),
    LightMeasurement.findOne({ flower_id: flowerId }).sort({ createdAt: -1 }),
    TemperatureMeasurement.findOne({ flower_id: flowerId }).sort({
      createdAt: -1,
    }),
    WaterMeasurement.findOne({ flower_id: flowerId }).sort({ createdAt: -1 }),
  ]);

  return {
    battery,
    humidity,
    light,
    temperature,
    water,
  };
}

export default measurementGetLatestDao;
