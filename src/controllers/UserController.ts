import { Request, Response } from "express";
import { provide } from "inversify-binding-decorators";
import { inject } from "inversify";
import { UserService } from "@services/UserService";
import { userDecoder, userPasswordUpdateDecoder } from "@models/UserModel";
import { logger } from "@utils/winston";
import { AuthService } from "@services/AuthService";
import { extractPaginateOptions } from "@utils/pagination";
import httpErrors from "http-errors";

@provide(UserController)
export class UserController {

    @inject(AuthService) private authService: AuthService;
    @inject(UserService) private userService: UserService;

    public async create(req: Request, res: Response) {
        try {
            await this.authService.adminOnly(req);

            const user = userDecoder.runWithException(req.body);
            const saved = await this.userService.save(user);

            return res.status(201).send(saved);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async register(req: Request, res: Response) {
        try {
            const user = userDecoder.runWithException(req.body);
            const saved = await this.userService.save(user);

            return res.status(201).send(saved);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async find(req: Request, res: Response) {
        try {
            await this.authService.adminOnly(req);
            const pagination = extractPaginateOptions(req.body);

            const result = await this.userService.paginate(req.body.query, pagination);
            return res.status(200).send(result);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async findById(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                throw new httpErrors.BadRequest("Missing id in path params");
            }

            await this.authService.adminOnly(req);
            const obj = await this.userService.findById(req.params.id);

            return res.status(200).send(obj);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async updateById(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                throw new httpErrors.BadRequest("Missing id in path params");
            }

            await this.authService.adminOnly(req);
            const updated = await this.userService.updateById(req.params.id, req.body);

            return res.status(200).send(updated);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async updateMe(req: Request, res: Response) {
        try {
            const user = await this.authService.getUserFromRequest(req);
            if (req.body.password) {
                throw new httpErrors.BadRequest("Please use /update/password to update your password.");
            }
            if (req.body.roles && !user.isAdmin()) {
                throw new httpErrors.Forbidden("You can't update forbidden fields. Only admins can.");
            }

            const updated = await this.userService.updateById(user.id, req.body);
            return res.status(200).send(updated);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async updatePassword(req: Request, res: Response) {
        try {
            const updatePassword = userPasswordUpdateDecoder.runWithException(req.body);
            const user = await this.authService.getUserFromRequest(req);

            logger.info(`User ${user.username} is trying to update its password!`);
            await this.userService.updatePassword(user, updatePassword);

            return res.status(200).send({ message: "Password updated successfully" });
        } catch (err) {
            return res.status(400).send(err);
        }
    }

    public async deleteById(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                throw new httpErrors.BadRequest("Missing id in path params");
            }
            await this.userService.deleteById(req.params.id);
            return res.status(200).send({ message: "OK" } );
        } catch (err) {
            return res.status(400).send(err);
        }
    }

}
