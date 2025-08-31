import { Flower, FlowerProfile, Schedule, ScheduleResponse, SmartPot } from '../../types/flowerTypes'
import { api } from './api'

interface FlowerListResponse {
    status: string
    data: {
        itemList: Flower[]
        pageInfo: {
            total: number
            page: number
            limit: number
        }
    }
}

export const fetchFlowers = async (): Promise<Flower[]> => {
    const response = await api.get<Flower[]>('/flower/list')
    return response.data
}

export const fetchFlowersByHousehold = async (householdId: string): Promise<Flower[]> => {
    const response = await api.get<FlowerListResponse>(`/flower/list?household_id=${householdId}&page=1&limit=100`)

    if (!response.data.data?.itemList) {
        return []
    }
    return response.data.data.itemList.map(flower => ({
        ...flower,
    }))
}

export const fetchFlowerDetails = async (flowerId: string): Promise<{ status: string; data: Flower }> => {
    const response = await api.get<{ status: string; data: Flower }>(`/flower/get/${flowerId}`)
    return response.data
}

export const addFlower = async (flower: Omit<Flower, '_id'>): Promise<Flower> => {
    const flowerWithNullSerial = {
        ...flower,
        serial_number: null,
    }
    const response = await api.post<{ status: string; data: Flower }>('/flower/add', flowerWithNullSerial)

    if (!response.data.data) {
        throw new Error('ID from flower not returned from server')
    }
    return response.data.data
}

export const createFlowerProfile = async (
    profile: Omit<FlowerProfile, 'id' | 'created_at' | 'updated_at'>,
): Promise<FlowerProfile> => {
    const response = await api.post<FlowerProfile>('/api/flower-profiles/create', profile)
    return response.data
}

export const deleteFlower = async (id: string): Promise<void> => {
    const flowerDetails = await fetchFlowerDetails(id)
    const flower = flowerDetails.data

    if (flower.serial_number) {
        await updateSmartPot(flower.serial_number, {
            active_flower_id: null,
            household_id: flower.household_id,
        })

        await updateFlower(id, { serial_number: null })
    }

    await api.delete(`/flower/delete/${id}`)
}

export const fetchFlowerProfiles = async (): Promise<FlowerProfile[]> => {
    const response = await api.get<FlowerProfile[]>(`/flowerProfile/list`)
    return response.data
}

export const fetchScheduleByFlower = async (flowerId: string): Promise<Schedule> => {
    const response = await api.get<{ status: string; data: Schedule }>(`/flower/getSchedule/${flowerId}`)
    return response.data.data
}

export const createSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    const formattedSchedule = {
        flower_id: schedule.flower_id,
        active: schedule.active,
        monday: {
            from: schedule.monday?.from || null,
            to: schedule.monday?.to || null,
        },
        tuesday: {
            from: schedule.tuesday?.from || null,
            to: schedule.tuesday?.to || null,
        },
        wednesday: {
            from: schedule.wednesday?.from || null,
            to: schedule.wednesday?.to || null,
        },
        thursday: {
            from: schedule.thursday?.from || null,
            to: schedule.thursday?.to || null,
        },
        friday: {
            from: schedule.friday?.from || null,
            to: schedule.friday?.to || null,
        },
        saturday: {
            from: schedule.saturday?.from || null,
            to: schedule.saturday?.to || null,
        },
        sunday: {
            from: schedule.sunday?.from || null,
            to: schedule.sunday?.to || null,
        },
    }

    const response = await api.post<Schedule>('/schedule/create', formattedSchedule)
    return response.data
}

export const updateSchedule = async (id: string, schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.put<Schedule>(`/schedules/${id}`, schedule)
    return response.data
}

export const fetchSmartPots = async (): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>('/smart-pots')
    return response.data
}

export const fetchSmartPotsByHousehold = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>(`/smart-pot/household/${householdId}`)
    return response.data
}

export const fetchEmptySmartPotsByHousehold = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>(`/smart-pot/household/empty/${householdId}`)
    return response.data
}

export const createSmartPot = async (smartPot: Omit<SmartPot, 'id'>): Promise<SmartPot> => {
    const response = await api.post<SmartPot>('/smart-pots', smartPot)
    return response.data
}

export const updateSmartPot = async (id: string, smartPot: Partial<SmartPot>): Promise<SmartPot> => {
    const response = await api.put<SmartPot>(`/smart-pot/update`, smartPot)
    return response.data
}

export const updateFlower = async (id: string, flower: Partial<Flower>): Promise<Flower> => {
    const response = await api.put<{ status: string; data: Flower }>('/flower/update', { id, ...flower })

    return response.data.data
}

export const transplantFlowerWithSmartPot = async (
    smartPotSerialNumber: string,
    targetHouseholdId: string,
): Promise<Flower> => {
    try {
        const response = await api.post('/smart-pot/transplant-smartpot-with-flower', {
            serial_number: smartPotSerialNumber,
            household_id: targetHouseholdId,
        })

        return response.data.data
    } catch (error) {
        throw error
    }
}

export const transplantFlowerWithoutSmartPot = async (
    flowerId: string,
    targetHouseholdId: string,
    assignOldSmartPot: boolean,
    newFlowerId: string,
): Promise<Flower> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        const serialNumber = flowerDetails.data.serial_number

        if (assignOldSmartPot) {
            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                household_id: flowerDetails.data.household_id,
                active_flower_id: null,
            })

            await api.put('/flower/update', {
                id: flowerId,
                serial_number: null,
                household_id: targetHouseholdId,
            })

            await api.put('/flower/update', {
                id: newFlowerId,
                serial_number: serialNumber,
                household_id: flowerDetails.data.household_id,
            })

            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                active_flower_id: newFlowerId,
                household_id: flowerDetails.data.household_id,
            })
        } else {
            if (flowerDetails.data.serial_number) {
                await api.put('/smart-pot/update', {
                    serial_number: serialNumber,
                    household_id: flowerDetails.data.household_id,
                    active_flower_id: null,
                })
            }

            await api.put('/flower/update', {
                id: flowerId,
                serial_number: null,
                household_id: targetHouseholdId,
            })
        }

        const updatedFlower = await fetchFlowerDetails(flowerId)
        return updatedFlower.data
    } catch (error) {
        throw error
    }
}

export const transplantFlowerToSmartPot = async (
    flowerId: string,
    targetSmartPotId: string,
    householdId: string,
): Promise<Flower> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        const oldSerialNumber = flowerDetails.data.serial_number

        const smartPot = await api.get<{ status: string; data: SmartPot }>(
            `/smart-pot/get/${targetSmartPotId}?household_id=${householdId}`,
        )
        if (smartPot.data.data.active_flower_id) {
            throw new Error('Smartpot is already connected to another flower')
        }

        if (oldSerialNumber) {
            await api.put('/smart-pot/update', {
                serial_number: oldSerialNumber,
                active_flower_id: null,
                household_id: householdId,
            })
        }

        await api.put<{ status: string; data: Flower }>(`/flower/update`, {
            id: flowerId,
            serial_number: smartPot.data.data.serial_number,
        })

        await api.put('/smart-pot/update', {
            serial_number: smartPot.data.data.serial_number,
            active_flower_id: flowerId,
            household_id: householdId,
        })

        const updatedFlower = await fetchFlowerDetails(flowerId)
        return updatedFlower.data
    } catch (error) {
        throw error
    }
}

export const detachFlower = async (
    flowerId: string,
    serialNumber: string | null | undefined,
): Promise<{ success: boolean; message?: string }> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        if (!flowerDetails.data.serial_number) {
            throw new Error('Flower not found in store')
        }

        if (serialNumber) {
            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                active_flower_id: null,
                household_id: flowerDetails.data.household_id,
            })
        }
        await api.put('/flower/update', { id: flowerId, serial_number: null })
        return { success: true }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to detach flower',
        }
    }
}

export const updateSmartPotFlower = async (serialNumber: string, flowerId: string | null, householdId: string) => {
    const response = await api.put('/smart-pot/update', {
        serial_number: serialNumber,
        active_flower_id: flowerId,
        household_id: householdId,
    })
    return response.data.data
}

const updateScheduleByFlower = async (schedule: Schedule): Promise<ScheduleResponse> => {
    const response = await api.put<ScheduleResponse>(`/schedule/update`, schedule)
    return response.data
}

export { updateScheduleByFlower }
