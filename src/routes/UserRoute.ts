import Express from "express";
import { Route } from "./Route";
import { provide } from "inversify-binding-decorators";
import { UserController } from "@controllers/UserController";
import { inject } from "inversify";
import passport from "passport";

@provide(UserRoute)
export class UserRoute implements Route {

    @inject(UserController) private userController: UserController;

    makeRoutes(app: Express.Application): void {
        /**
         * @swagger
         *
         * /user:
         *   post:
         *     tags:
         *       - Users
         *     description: Creates a new user. Only admins can do this!
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: User
         *         description: User to register
         *         required: true
         *         in: body
         *         schema:
         *           $ref: "#/definitions/User"
         *     responses:
         *       201:
         *         description: User created (password will be encrypted)
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       403:
         *         $ref: "#/responses/Forbidden"
         *       409:
         *         description: Email and username must be unique
         */
        app.post("/user", passport.authenticate("jwt"), (req, res) => {
            this.userController.create(req, res);
        });

        /**
         * @swagger
         *
         * /user/query:
         *   post:
         *     tags:
         *       - Users
         *     description: Find users with a query and pagination options. Only admins can do this!
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: Query model
         *         required: true
         *         in: body
         *         schema:
         *           $ref: "#/definitions/QueryModel"
         *     responses:
         *       200:
         *         description: Query result
         *         schema:
         *           $ref: "#/definitions/Paginated"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       403:
         *         $ref: "#/responses/Forbidden"
         */
        app.post("/user/query", passport.authenticate("jwt"), (req, res) => {
            this.userController.find(req, res);
        });

        /**
         * @swagger
         *
         * /user/{id}:
         *   get:
         *     tags:
         *       - Users
         *     description: Find a user by id. Only admins can do this!
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: id
         *         required: true
         *         in: path
         *         description: Mongo id of the user to find
         *     responses:
         *       200:
         *         description: User found
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       403:
         *         $ref: "#/responses/Forbidden"
         */
        app.post("/user/:id", passport.authenticate("jwt"), (req, res) => {
            this.userController.findById(req, res);
        });

        /**
         * @swagger
         *
         * /user/{id}:
         *   put:
         *     tags:
         *       - Users
         *     description: Update an user by its id. Only admins can do this!
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: id
         *         required: true
         *         in: path
         *         description: Mongo id of the user to update
         *       - name: Update body
         *         required: true
         *         in: body
         *         description: Update body following the User model
         *     responses:
         *       200:
         *         description: Updated user
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       403:
         *         $ref: "#/responses/Forbidden"
         */
        app.put("/user/:id", passport.authenticate("jwt"), (req, res) => {
            this.userController.updateById(req, res);
        });

        /**
         * @swagger
         *
         * /user/register:
         *   post:
         *     tags:
         *       - Users
         *     description: Register a new user
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: User
         *         description: User to register
         *         required: true
         *         in: body
         *         schema:
         *           $ref: "#/definitions/User"
         *     responses:
         *       201:
         *         description: User created (password will be encrypted)
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       409:
         *         description: Email and username must be unique
         */
        app.post("/user/register", (req, res) => {
            this.userController.register(req, res);
        });

        /**
         * @swagger
         *
         * /user/update/password:
         *   put:
         *     tags:
         *       - Users
         *     description: Update user password
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: Password update model
         *         required: true
         *         in: body
         *         schema:
         *           $ref: "#/definitions/UserPasswordUpdate"
         *     security:
         *       - JWT: []
         *     responses:
         *       200:
         *         description: Password updated successfully
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         */
        app.post("/user/register", (req, res) => {
            this.userController.updatePassword(req, res);
        });

        /**
         * @swagger
         *
         * /user/update/me:
         *   put:
         *     tags:
         *       - Users
         *     description: Update a user based on who is making the request (token)
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: Update body
         *         required: true
         *         in: body
         *         description: Update body following the User model **(don't include password!)**
         *     responses:
         *       200:
         *         description: Updated user
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         */
        app.put("/user/update/me", passport.authenticate("jwt"), (req, res) => {
            this.userController.updateMe(req, res);
        });

        /**
         * @swagger
         *
         * /user/{id}:
         *   delete:
         *     tags:
         *       - Users
         *     description: Delete a user by its id. Only admins can do this!
         *     produces:
         *       - application/json
         *     security:
         *       - JWT: []
         *     parameters:
         *       - name: id
         *         required: true
         *         in: path
         *         description: Mongo id of the user to delete
         *     responses:
         *       200:
         *         description: Deleted user
         *         schema:
         *           $ref: "#/definitions/UserDocument"
         *       400:
         *         $ref: "#/responses/BadRequest"
         *       401:
         *         $ref: "#/responses/Unauthorized"
         *       403:
         *         $ref: "#/responses/Forbidden"
         */
        app.delete("/user/:id", passport.authenticate("jwt"), (req, res) => {
            this.userController.deleteById(req, res);
        });
    }

}
