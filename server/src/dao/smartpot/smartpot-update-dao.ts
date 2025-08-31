import SmartPotModel, { ISmartPot } from '../../models/SmartPot'

async function smartpotUpdateDao(smartpotData: ISmartPot) {
  const existingSmartPot = await SmartPotModel.findOne({
    serial_number: smartpotData.serial_number,
  })
  if (!existingSmartPot) {
    return null
  }
  console.log('existingSmartPot', existingSmartPot)

  // Prepare update data
  const updateData: any = {
    serial_number: smartpotData.serial_number,
  }

  // Only add fields if they exist or are explicitly null
  if (smartpotData.household_id !== undefined) {
    updateData.household_id = smartpotData.household_id
  }

  // Explicitly handle active_flower_id, including null values
  /* updateData.active_flower_id = smartpotData.active_flower_id */
  if (smartpotData.active_flower_id === null || smartpotData.active_flower_id === undefined) {
    updateData.active_flower_id = null;
  } else {
    updateData.active_flower_id = smartpotData.active_flower_id;
  }

  console.log('Update data being applied:', updateData)

  const updatedSmartPot = await SmartPotModel.findOneAndUpdate(
    { serial_number: smartpotData.serial_number },
    { $set: updateData },
    { new: true }
  )

  console.log('updatedSmartPot', updatedSmartPot)
  return updatedSmartPot
}

export default smartpotUpdateDao
