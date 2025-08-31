import BatteryMeasurementModel from '../../models/BatteryMeasurement'
import FlowerModel, { IFlower } from '../../models/Flower'
import FlowerProfileModel from '../../models/FlowerProfile'
import HumidityMeasurementModel from '../../models/HumidityMeasurement'
import LightMeasurementModel from '../../models/LightMeasurement'
import ScheduleModel from '../../models/Schedule'
import TemperatureMeasurementModel from '../../models/TemperatureMeasurement'
import WaterMeasurementModel from '../../models/WaterMeasurement'

export interface ExportedFlower {
  flower: IFlower
  measurements: {
    battery: any[]
    humidity: any[]
    light: any[]
    temperature: any[]
    water: any[]
  }
  schedule: any
  profile: any
}

export const exportFlower = async (flowerId: string): Promise<ExportedFlower> => {
  try {
    const flowerDoc = await FlowerModel.findById(flowerId)
    if (!flowerDoc) {
      throw new Error('Flower not found')
    }

    // Získame všetky merania
    const [batteryMeasurements, humidityMeasurements, lightMeasurements, temperatureMeasurements, waterMeasurements] =
      await Promise.all([
        BatteryMeasurementModel.find({ flower_id: flowerId }),
        HumidityMeasurementModel.find({ flower_id: flowerId }),
        LightMeasurementModel.find({ flower_id: flowerId }),
        TemperatureMeasurementModel.find({ flower_id: flowerId }),
        WaterMeasurementModel.find({ flower_id: flowerId }),
      ])

    // Získame rozvrh
    const schedule = await ScheduleModel.findOne({ flower_id: flowerId })

    // Získame profil ak existuje
    const profile = flowerDoc.profile_id ? await FlowerProfileModel.findById(flowerDoc.profile_id) : null

    return {
      flower: flowerDoc,
      measurements: {
        battery: batteryMeasurements,
        humidity: humidityMeasurements,
        light: lightMeasurements,
        temperature: temperatureMeasurements,
        water: waterMeasurements,
      },
      schedule,
      profile,
    }
  } catch (error) {
    throw error
  }
}
