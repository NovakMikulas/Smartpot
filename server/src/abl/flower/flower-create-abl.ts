import { FastifyReply } from "fastify";
import { IFlower } from "../../models/Flower";
import {
  sendClientError,
  sendCreated,
  sendError,
} from "../../middleware/response-handler";
import flowerCreateDao from "../../dao/flower/flower-create-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import Ajv from "ajv";
import checkSmartPotExists from "../../dao/smartpot/smartpot-exists-dao";
import flowerProfileGetDao from "../../dao/flowerProfile/flowerProfile-get-dao";
const schema = {
  type: "object",
  properties: {
    household_id: { type: "string" },
    name: { type: "string" },
    //serial_number: { type: "string" },
  },
  required: ["household_id", "name"],
};
const ajv = new Ajv();
async function flowerCreateAbl(data: IFlower, reply: FastifyReply) {
  console.log(data);
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    if (data.profile_id) {
      const doesFlowerProfileExist = await flowerProfileGetDao(data.profile_id);
      if (!doesFlowerProfileExist) {
        sendClientError(reply, "Flower profile does not exist");
        return;
      }
    }
    if (data.household_id) {
      const doesHouseholdExist = await householdGetDao(
        data.household_id.toString()
      );
      if (!doesHouseholdExist) {
        sendClientError(reply, "Household does not exist");
        return;
      }
    }
    /* if (data.serial_number) {
      const doesSmartPotExist = await checkSmartPotExists(
        data.serial_number.toString()
      );
      if (!doesSmartPotExist) {
        sendClientError(reply, "Smart pot does not exist");
        return;
      }
    } */
    const createdFlower = await flowerCreateDao(data);
    sendCreated(reply, createdFlower, "Flower created successfully");
  } catch (error) {
    console.error("Error creating flower:", error);
    sendError(reply, error as Error);
  }
}

export default flowerCreateAbl;
