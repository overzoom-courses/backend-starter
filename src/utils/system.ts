import { UserDocument, UserRoles } from "@models/UserModel";
import { ioc } from "@ioc";
import { UserService } from "@services/UserService";
import { logger } from "@utils/winston";

export async function generateSystemUser(): Promise<UserDocument> {
    logger.info("Creating system user!");
    try {
        return await ioc.resolve(UserService).save({
            username: "system",
            email: "system@server",
            password: process.env.SYSTEM_PASS,
            roles: [ UserRoles.ROLE_USER, UserRoles.ROLE_ADMIN ]
        });
    } catch (err) {
        logger.error(`Failed to create system user! ${err}`);
    }
}
