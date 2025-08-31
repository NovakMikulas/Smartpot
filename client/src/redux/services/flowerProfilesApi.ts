import { FlowerProfile , Schedule} from '../../types/flowerTypes'
import { api } from './api'

export const flowerProfilesApi = {
    getFlowerProfiles: async (): Promise<FlowerProfile[]> => {
        const response = await api.get<{ status: string; data: FlowerProfile[] }>('/flowerProfile/list')
      
        return response.data.data || []
    },
    getFlowerProfile: async (id: string): Promise<FlowerProfile> => {
        const response = await api.get<{ status: string; data: FlowerProfile }>(`/flowerProfile/get/${id}`)
        return response.data.data
    },
    
    
   

    getFlowerSchedule: async (id: string): Promise<Schedule> => {
        const response = await api.get<{ status: string; data: Schedule }>(`/flower/schedule/${id}`)
        return response.data.data
    },
}
