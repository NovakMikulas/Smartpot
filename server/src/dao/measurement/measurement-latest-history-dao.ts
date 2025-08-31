import HumidityMeasurementModel from '../../models/HumidityMeasurement'
import LightMeasurementModel from '../../models/LightMeasurement'
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement'
import WaterMeasurementModel from '../../models/WaterMeasurement'
import BatteryMeasurementModel from '../../models/BatteryMeasurement'

const measurementModelMap: Record<string, any> = {
  water: WaterMeasurementModel,
  light: LightMeasurementModel,
  humidity: HumidityMeasurementModel,
  temperature: TemperatureMeasurementModel,
  battery: BatteryMeasurementModel,
}

async function measurementLatestHistoryDao(flowerId: string) {
  const results = await Promise.all(
    Object.entries(measurementModelMap).map(async ([type, Model]) => {
      const latestMeasurement = await Model.findOne({ flower_id: flowerId })
        .sort({ createdAt: -1 })
        .lean()

      return {
        type,
        measurement: latestMeasurement,
      }
    })
  )

  return results.reduce((acc, { type, measurement }) => {
    acc[type] = measurement
    return acc
  }, {} as Record<string, any>)
}

export default measurementLatestHistoryDao
