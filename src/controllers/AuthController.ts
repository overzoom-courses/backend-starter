import { Request, Response } from "express";
import { provide } from "inversify-binding-decorators";
import { inject } from "inversify";
import { AuthService, LoginPayload } from "@services/AuthService";
import { Unauthorized } from "http-errors";

@provide(AuthController)
export class AuthController {

    @inject(AuthService) private authService: AuthService;

    async login(req: Request, res: Response) {
        const payload: LoginPayload = req.body;
        if (!payload.username || !payload.password) {
            return res.status(400).send("Missing Fields")
        }
        try {
            const token = await this.authService.login(payload);
            return res.status(200).send({ token });
        } catch (err) {
            if (err instanceof Unauthorized) {
                return res.status(err.statusCode).send(err.message)
            }
            return res.status(500).send({ message: "Login error" })
        }
    }

    async me(req: Request, res: Response) {
        try {
            const user = await this.authService.getUserFromRequest(req);
            return res.status(200).send(user);
        } catch (err) {
            return res.status(400).send(err);
        }
    }

}
