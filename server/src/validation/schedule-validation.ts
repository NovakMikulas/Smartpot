import Ajv, { JSONSchemaType } from "ajv";
import { ISchedule } from "../models/Schedule";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);

// Time slot schema for reusability
const timeSlotSchema = {
  type: "object",
  properties: {
    from: {
      type: ["string", "null"],
      pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", // HH:mm format
      nullable: true,
      default: null
    },
    to: {
      type: ["string", "null"],
      pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", // HH:mm format
      nullable: true,
      default: null
    },
  },
  additionalProperties: false,
  default: { from: null, to: null }
} as const;

// Create schedule schema
export const createScheduleSchema = {
  type: "object",
  properties: {
    flower_id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" }, // MongoDB ObjectId format
    active: { type: "boolean", default: false },
    monday: { ...timeSlotSchema, default: { from: null, to: null } },
    tuesday: { ...timeSlotSchema, default: { from: null, to: null } },
    wednesday: { ...timeSlotSchema, default: { from: null, to: null } },
    thursday: { ...timeSlotSchema, default: { from: null, to: null } },
    friday: { ...timeSlotSchema, default: { from: null, to: null } },
    saturday: { ...timeSlotSchema, default: { from: null, to: null } },
    sunday: { ...timeSlotSchema, default: { from: null, to: null } }
  },
  required: ["flower_id"],
  additionalProperties: false,
} as const;

// Update schedule schema
export const updateScheduleSchema = {
  type: "object",
  properties: {
    _id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    flower_id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    active: { type: "boolean" },
    monday: timeSlotSchema,
    tuesday: timeSlotSchema,
    wednesday: timeSlotSchema,
    thursday: timeSlotSchema,
    friday: timeSlotSchema,
    saturday: timeSlotSchema,
    sunday: timeSlotSchema,
  },
  required: ["_id"],
  additionalProperties: false,
} as const;

// Get schedule schema
export const getScheduleSchema = {
  type: "object",
  properties: {
    id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
  },
  required: ["id"],
  additionalProperties: false,
} as const;

// Compile validators
export const validateCreateSchedule =
  ajv.compile<ISchedule>(createScheduleSchema);
export const validateUpdateSchedule =
  ajv.compile<ISchedule>(updateScheduleSchema);
export const validateGetSchedule = ajv.compile(getScheduleSchema);

// Helper function to format validation errors
export function formatValidationErrors(
  errors: any[] | null | undefined
): string {
  if (!errors) return "Validation failed";
  return errors
    .map((error) => {
      const field =
        error.instancePath.replace("/", "") || error.params.missingProperty;
      return `${field}: ${error.message}`;
    })
    .join(", ");
}
