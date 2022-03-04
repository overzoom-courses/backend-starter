import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { ioc } from "@ioc";
import { UserService } from "@services/UserService";
import { cleanTestDB } from "@utils/mongo";
import { generateMockUser, userGiovanni } from "../mocks/user";
import { UserDocument, UserRoles } from "@models/UserModel";
import { logger } from "@utils/winston";
import { assertSameUser } from "../test_utils";
import { generateSystemUser } from "@utils/system";
// @ts-ignore
import faker from "faker/locale/it";

// User saved from userGiovanni
let dummy: UserDocument;

@suite ("UserService") class UserServiceTests {

    userService = ioc.resolve(UserService);
    mockUser = userGiovanni;

    static async before() { await generateSystemUser(); }
    static after() { cleanTestDB(); }

    @test async "Should save a new dummy user" () {
        try {
            dummy = await this.userService.save(this.mockUser);
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        expect(dummy).to.exist;
        expect(dummy.username).to.equal(this.mockUser.username);
        expect(dummy.email).to.equal(this.mockUser.email.toLowerCase());
        expect(dummy.password).not.to.equal(this.mockUser.password, "!!! PASSWORD WAS NOT HASHED !!!");
        expect(dummy.roles).contains(UserRoles.ROLE_USER);
        expect(dummy._id).to.exist;
    }

    @test async "Should not save a duplicate dummy user" () {
        let newUser: UserDocument;
        try {
            newUser = await this.userService.save(this.mockUser);
        } catch (err) {
            expect(err).to.exist;
        }
        expect(newUser).not.to.exist;
    }

    @test async "Should find dummy user by id and conditions" () {
        let found: UserDocument;
        try {
            found = await this.userService.findById(dummy._id);
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        assertSameUser(dummy, found);

        try {
            found = (await this.userService.find({
                username: this.mockUser.username
            }))[0];
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        assertSameUser(dummy, found);
    }

    @test async "Should update dummy user by id and conditions" () {
        let updated: UserDocument;
        const newUsername = faker.internet.userName(),
              newPassword = faker.internet.password();
        try {
            updated = await this.userService.updateById(dummy._id, {
                username: newUsername,
                password: newPassword
            });
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        expect(updated).to.exist;
        expect(updated.username).not.to.equal(dummy.username);
        expect(updated.email).to.equal(dummy.email);
        expect(updated.password).not.to.equal(newPassword, "!!! PASSWORD WAS NOT HASHED !!!");

        try {
            updated = await this.userService.updateOne({
                email: this.mockUser.email
            }, {
                username: newUsername,
                password: newPassword
            });
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        expect(updated).to.exist;
        expect(updated._id.toString()).to.equal(dummy._id.toString());
        expect(updated.username).not.to.equal(dummy.username);
        expect(updated.email).to.equal(dummy.email);
        expect(updated.password).not.to.equal(newPassword, "!!! PASSWORD WAS NOT HASHED !!!");
    }

    @test async "Should not update dummy user email to generate a duplicate" () {
        let anotherDummy: UserDocument;
        try {
            anotherDummy = await this.userService.save(generateMockUser());
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }

        let updated: UserDocument;
        try {
            updated = await this.userService.updateById(dummy._id, {
                email: anotherDummy.email,
            });
        } catch (err) {
            expect(err).to.exist;
            expect(err.name).to.equal("ConflictError");
        }
        expect(updated).not.to.exist;
    }

    @test async "Should delete dummy user by id" () {
        let deleted: UserDocument;
        try {
            deleted = await this.userService.deleteById(dummy._id);
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        expect(deleted).to.exist;
        expect(deleted._id.toString()).to.equal(dummy._id.toString());

        // Should not find it anymore
        let found: UserDocument;
        try {
            found = await this.userService.findById(dummy._id);
        } catch (err) {
            expect(err).to.exist;
        }
        expect(found).not.to.exist;
    }

    @test async "Should trim emails" () {
        const trimEmail = "ToTRim    @Gmail.com";
        let anotherDummy: UserDocument;
        try {
            let user = generateMockUser();
            user.email = trimEmail;
            anotherDummy = await this.userService.save(user);
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }

        let found: UserDocument;
        try {
            found = await this.userService.findById(anotherDummy._id);
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }
        expect(found).to.exist;
        expect(found.email).to.equal(trimEmail.toLowerCase().trim());
    }

}
