import mongoose from "mongoose";

export class MongoValidator {
    static isValidObjectId(id: string | undefined | null): boolean {
        return !!id && mongoose.Types.ObjectId.isValid(id);
    }

    static validateId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    static validateIds(ids: (string | undefined | null)[]): void {
        ids.forEach(id => {
            if (!this.isValidObjectId(id)) {
                throw new Error(`Invalid MongoDB ObjectId format: ${id}`);
            }
        });
    }
} 

