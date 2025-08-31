import { IFlower } from "../../models/Flower";

export function isValueOutOfRange(
  typeOfData: string,
  value: number,
  flower: IFlower
): { outOfRange: boolean; message: string; flower: IFlower } | null {
  const profile = flower.profile;

  const checks: {
    [key: string]: (
      value: number
    ) => { outOfRange: boolean; message: string; flower: IFlower } | null;
  } = {
    soil: (value) => {
      const { min, max } = profile.humidity || {};
      if (min === null || max === null) return null;
      if (value < min || value > max) {
        return {
          outOfRange: true,
          message: `Soil humidity out of range! Measured ${value}%, expected between ${min}% - ${max}%`,
          flower,
        };
      }
      return { outOfRange: false, message: "", flower };
    },
    temperature: (value) => {
      const { min, max } = profile.temperature || {};
      if (min === null || max === null) return null;
      if (value < min || value > max) {
        return {
          outOfRange: true,
          message: `Temperature out of range! Measured ${value}°C, expected between ${min}°C - ${max}°C`,
          flower,
        };
      }
      return { outOfRange: false, message: "", flower };
    },
    light: (value) => {
      const { min, max } = profile.light || {};
      if (min === null || max === null) return null;
      if (value < min || value > max) {
        return {
          outOfRange: true,
          message: `Light intensity out of range! Measured ${value}lux, expected between ${min}lux - ${max}lux`,
          flower,
        };
      }
      return { outOfRange: false, message: "", flower };
    },
    battery: (value) => {
      const batteryThreshold = 30;
      if (value < batteryThreshold) {
        return {
          outOfRange: true,
          message: `Battery low! Measured ${value}%, should be at least ${batteryThreshold}%`,
          flower,
        };
      }
      return { outOfRange: false, message: "", flower };
    },
  };

  const checkFn = checks[typeOfData];
  if (!checkFn) return null;

  return checkFn(value);
}
