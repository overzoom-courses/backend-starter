import { Document } from "mongoose";

/**
 * @swagger
 *
 * definitions:
 *   PaginateOptions:
 *     type: object
 *     properties:
 *       pageIndex:
 *         type: number
 *         description: 0-based page number
 *       pageSize:
 *         type: number
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
export interface QueryOptions {
    populate?: string
    select?: string
    sort?: Object
}
export interface PaginateOptions extends QueryOptions {
    pageIndex?: number
    pageSize?: number
}

/**
 * @swagger
 *
 * definitions:
 *   Paginated:
 *     type: object
 *     properties:
 *       meta:
 *         type: object
 *         properties:
 *           total:
 *             type: number
 *             description: Total number of documents present (estimated)
 *           pages:
 *             type: number
 *             description: Total number of pages (estimated by total)
 *       docs:
 *         type: array
 *         description: Documents on this page
 *         items:
 *           type: object
 */
export interface Paginated<T extends Document> {
    meta: {
        total: number
        pages: number
    }
    docs: T[]
}

export function extractPaginateOptionsFromBody(body: any): PaginateOptions {
    const { pagination } = body;
    if (!pagination) {
        return {};
    }

    return {
        pageIndex: parseInt(body["pageIndex"] || "0"),
        pageSize: parseInt(body["pageSize"] || "10"),
        sort: typeof body["sort"] === "string" ? JSON.parse(body["sort"] || "{}") : body["sort"],
        populate: body["populate"] || "",
        select: body["select"] || "",
    };
}
