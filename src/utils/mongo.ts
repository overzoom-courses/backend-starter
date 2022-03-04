import { connection } from "mongoose";
import { logger } from "./winston";

// Build mongo connection uri based on process.env values
export const MONGO_URI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}`;

export async function cleanTestDB() {
    const dbName = connection.db.databaseName.toLowerCase();
    if (process.env.NODE_ENV !== 'test' || !dbName.includes("test")) {
        // Not a test environment or not operating on a test database!!!
        logger.error("Tried to drop test database on a non-test environment");
        return { ok: false, error: "WTF" };
    }
    // Drop the database
    try {
        logger.info("Dropping test database...");
        await connection.db.dropDatabase();
        return { ok: true, message: "Test DB dropped!" };
    } catch (err) {
        return { ok: false, error: err }
    }
}
