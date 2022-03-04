import Express from "express";
import { provide } from "inversify-binding-decorators";
import { inject } from "inversify";
import { Route } from "./Route";
import { AuthController } from "@controllers/AuthController";

@provide(AuthRoute)
export class AuthRoute implements Route {

    @inject(AuthController) private authController: AuthController;

    makeRoutes(app: Express.Application) {
        /**
         * @swagger
         *
         * /auth/login:
         *   post:
         *     tags:
         *       - Authentication
         *     description: Login into the application
         *     produces:
         *       - text/plain
         *     parameters:
         *       - name: Payload
         *         description: Login payload
         *         required: true
         *         in: body
         *         schema:
         *           $ref: "#/definitions/LoginPayload"
         *     responses:
         *       200:
         *         description: Login successful, returns encoded JWT token
         *       401:
         *         description: Login failed. Invalid username/email or password
         */
        app.post("/auth/login", (req, res) => {
            this.authController.login(req, res);
        });

        /**
         * @swagger
         *
         * /auth/me:
         *   get:
         *     tags:
         *       - Authentication
         *     description: Gets current logged-in user (by token)
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     responses:
         *       200:
         *         description: User currently logged in (Password will be encrypted)
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         description: Bad JWT token format
         *       401:
         *         $ref: "#/responses/Unauthorized"
         */
        app.post("/auth/me", (req, res) => {
            this.authController.me(req, res);
        });
    }

}
