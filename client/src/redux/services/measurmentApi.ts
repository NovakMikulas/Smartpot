import { MeasurementValue } from '../../types/flowerTypes'
import { api } from './api'

interface MeasurementResponse {
    status: string
    data: MeasurementValue[]
}

export const getMeasurementsForFlower = async (
    flowerId: string,
    dateFrom: string,
    dateTo: string,
    typeOfData: 'water' | 'humidity' | 'temperature' | 'light' | 'battery' | 'soil',
): Promise<MeasurementResponse> => {
    try {
        const requestBody = {
            id: flowerId,
            typeOfData: typeOfData === 'soil' ? 'humidity' : typeOfData,
            dateFrom,
            dateTo,
        }

        const response = await api.post(`/measurement/history`, requestBody)

        if (!response.data || !response.data.data) {
            console.error(`Invalid response format for ${typeOfData}:`, response.data)
        }

        const measurementsWithType = {
            ...response.data,
            data: response.data.data.map((measurement: any) => ({
                ...measurement,
                typeOfData: typeOfData === 'soil' ? 'humidity' : typeOfData,
            })),
        }

        return measurementsWithType
    } catch (error) {
        console.error(`Error in getMeasurementsForFlower for ${typeOfData}:`, error)
        throw error
    }
}
