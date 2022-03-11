import { PaginateOptions } from "mongoose";

/**
 * @swagger
 *
 * definitions:
 *   QueryOptions:
 *     type: object
 *      sort:
 *         type: object
 *         description: Sort object following the Mongoose notation
 *       populate:
 *         type: string
 *         description: Fields to populate separated by spaces
 *       select:
 *         type: string
 *         description: Fields to select separated by spaces
 */
export type QueryOptions = Pick<PaginateOptions, "select" | "sort" | "populate">

/**
 * @swagger
 *
 * definitions:
 *   PaginateOptions:
 *     type: object
 *     properties:
 *       page:
 *         type: number
 *         description: 1-based page number
 *       limit:
 *         type: number
 *         description: Page size
 *       sort:
 *         type: object
 *         description: Sort object following the Mongoose notation
 *       populate:
 *         type: string
 *         description: Fields to populate separated by spaces
 *       select:
 *         type: string
 *         description: Fields to select separated by spaces
 */
export function extractPaginateOptions(object: any): PaginateOptions {
    const { pagination } = object;
    if (!pagination) {
        return {};
    }

    return {
        page: parseInt(object["page"] || "0"),
        limit: parseInt(object["limit"] || "10"),
        sort: typeof object["sort"] === "string" ? JSON.parse(object["sort"] || "{}") : object["sort"],
        populate: object["populate"] || "",
        select: object["select"] || "",
    };
}
