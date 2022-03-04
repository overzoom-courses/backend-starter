/**
 * @swagger
 *
 * responses:
 *   BadRequest:
 *      description: Invalid request body
 *   Unauthorized:
 *     description: Invalid or expired authorization
 *   Forbidden:
 *     description: Higher privileges are required for this call
 *   NotFound:
 *     description: The specified resource was not found
 */

export interface Route {
    makeRoutes(app: Express.Application): void;
}
