import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import helmet from "helmet";

import { provide } from "inversify-binding-decorators";
import { ioc } from "@ioc";

import { AuthService } from "@services/AuthService";
import { UserService } from "@services/UserService";

import { Route } from "@routes/Route";
import { AuthRoute } from "@routes/AuthRoute";
import { UserRoute } from "@routes/UserRoute";

import { MONGO_URI } from "@utils/mongo";
import { logger } from "@utils/winston";
import { cors } from "@utils/cors";
import { swaggerUi, serveSwagger } from "@utils/swagger";
import { generateSystemUser } from "@utils/system";

@provide(ExpressServer)
export class ExpressServer {

    app: express.Application;
    server: http.Server;

    routes: Route[] = [
        ioc.resolve(AuthRoute),
        ioc.resolve(UserRoute),
    ];

    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {
        logger.info("Starting server");
        this.app = express();
        this.server = http.createServer(this.app);

        this.setupConfig();
        this.setupDatabase();
        this.setupRoutes();
        this.setupPassport();
        this.setupSystemUser();
        this.setupSwagger();
    }

    private setupConfig() {
        logger.info("Setting up config!");
        this.app.use(bodyParser.json());
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof SyntaxError && "body" in err) {
                return res.status(400).send({ message: "Bad JSON" })
            }
            next();
        });
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            res.status(500).send({ error: err });
        });
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors);
        this.app.use(helmet());
        this.app.use(express.static("public/assets"));
        this.app.disable("x-powered-by");

        // STATIC FILES ROUTES
        this.app.use("/documents", express.static("public/pdf"));
        this.app.use("/invoices", express.static("public/invoices"));
        this.app.use("/attachments", express.static("public/attachments"));
    }

    private setupDatabase() {
        logger.info("Connecting to database!");
        mongoose.connect(MONGO_URI, {
            autoIndex: true,
            autoCreate: true,
        }).then(() => logger.info("Connected to database!"))
          .catch(err => logger.error("◇ Failed to connect to MongoDB!", err));
    }

    private setupRoutes() {
        logger.info("Setting up endpoints!");
        this.routes.forEach(route => route.makeRoutes(this.app));
    }

    private setupPassport() {
        logger.info("Setting up passport authentication!");
        this.app.use(this.authService.getPassportMiddleware());
    }

    private async setupSystemUser() {
        if (await this.userService.countDocuments() > 0 || process.env.NODE_ENV === "test") return;
        await generateSystemUser();
    }

    private setupSwagger() {
        if (process.env.NODE_ENV === "test") return;
        logger.info("Setting up Swagger documentation!");
        this.app.use("/docs", serveSwagger, swaggerUi);
    }

}
