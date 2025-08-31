import { IHousehold } from "../models/Household";
import { Types } from "mongoose";
import { FastifyRequest, FastifyReply } from "fastify";
import householdGetDao from "../dao/household/household-get-dao";
import getFlower from "../dao/flower/flower-get-dao";

function isOwner(household: IHousehold, userId: string) {
    return household.owner.equals(new Types.ObjectId(userId));
}

function isMember(household: IHousehold, userId: string) {
    return household.members.some(member => member.equals(new Types.ObjectId(userId)));
}

// Define a type for the user object
interface IUser {
    id: string;
}

export function householdAuthMidlleware(authorizedRole: string[]) {
    console.log("householdAuth Middleware called", authorizedRole);
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (authorizedRole.length === 0) {
            return reply.code(500).send({ error: "No authorized roles provided" });
        }

        // Použití request.routeOptions.url místo zastaralého request.routerPath
        const isHouseholdRoute: boolean = request.routeOptions?.url?.includes("household") ?? false;
        const isFlowerRoute: boolean = request.routeOptions?.url?.includes("flower") ?? false;

        console.log("isHouseholdRoute:", isHouseholdRoute);
        console.log("isFlowerRoute:", isFlowerRoute);

        const householdIdKey: "id" | "household_id" = isHouseholdRoute ? "id" : "household_id";

        const requestData = request as {
            query?: Record<string, string | undefined>;
            params?: Record<string, string | undefined>;
            body?: Record<string, any>;
        };

        let householdId: string | undefined;
        let flowerId: string | undefined;

        if (isFlowerRoute) {
            // Pokud jsme na flower route, ID květiny je `id`
            flowerId = requestData.query?.id || requestData.params?.id || requestData.body?.id;
            householdId =
                requestData.query?.[householdIdKey] ||
                requestData.params?.[householdIdKey] ||
                requestData.body?.[householdIdKey];
            
        } else {
            // Jinak hledáme `household_id`
            householdId =
                requestData.query?.[householdIdKey] ||
                requestData.params?.[householdIdKey] ||
                requestData.body?.[householdIdKey];
        }



        // Pokud máme `flowerId` a ne `householdId`, pokusíme se ho získat
        if (!householdId && flowerId) {
            try {
          
                const flower = await getFlower(flowerId as string);
                if (!flower || !flower.household_id) {
                    return reply.code(404).send({ error: `Flower with ID ${flowerId} not found or missing household_id` });
                }
                householdId = flower.household_id.toString();
            } catch (error) {
                console.error("Error fetching flower:", error);
                return reply.code(500).send({ error: "Error fetching flower data" });
            }
        }

        if (!householdId) {
            return reply.code(400).send({ error: "Household ID is required" });
        }


        let household: IHousehold;
        try {
            household = await householdGetDao(householdId) as IHousehold;
        } catch (error) {
            console.error("Error fetching household:", error);
            return reply.code(500).send({ error: "Error fetching household data" });
        }

        const userId = (request.user as { user?: { id?: string } })?.user?.id;

        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized: User ID missing" });
        }

        let hasAccess = false;

        for (const role of authorizedRole) {
            if (role === "owner" && isOwner(household, userId)) {
                hasAccess = true;
                break;
            }
            if (role === "member" && isMember(household, userId)) {
                hasAccess = true;
                break;
            }
        }

        if (!hasAccess) {
            return reply.code(403).send({ error: "Access denied" });
        }
    };
}
