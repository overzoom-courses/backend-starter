import { Request, Response } from "express";
import { provide } from "inversify-binding-decorators";
import { inject } from "inversify";
import { AuthService, LoginPayload } from "@services/AuthService";
import httpErrors from "http-errors";

@provide(AuthController)
export class AuthController {

    @inject(AuthService) private authService: AuthService;

    async login(req: Request, res: Response) {
        const payload: LoginPayload = req.body;
        if (!payload.username || !payload.password) {
            throw new httpErrors.Unauthorized("Invalid username or password!");
        }

        try {
            const token = await this.authService.login(payload);
            return res.status(200).send({ token });
        } catch (err) {
            throw new httpErrors.Unauthorized("Invalid username or password!");
        }
    }

    async me(req: Request, res: Response) {
        const user = await this.authService.getUserFromRequest(req);
        return res.status(200).send(user);
    }

}
