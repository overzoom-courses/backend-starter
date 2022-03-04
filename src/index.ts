import "module-alias/register";
import "reflect-metadata";

require("dotenv-flow").config();

import { ioc } from "@ioc";
import { buildProviderModule } from "inversify-binding-decorators";

ioc.load(buildProviderModule());

import { logger } from "@utils/winston";
import { ExpressServer } from "@server";

const express = ioc.resolve(ExpressServer);
const port = parseInt(process.env.SERVER_PORT || "5000");

express.server.listen(port, () => {
    logger.info(`Backend starter server up and running in ${process.env.NODE_ENV} environment on port ${port}`);
});
