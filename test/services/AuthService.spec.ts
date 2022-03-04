import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { ioc } from "@ioc";
import { UserService } from "@services/UserService";
import { AuthService } from "@services/AuthService";
import { cleanTestDB } from "@utils/mongo";
import { logger } from "@utils/winston";
import { generateSystemUser } from "@utils/system";

@suite ("AuthService") class AuthServiceTests {

    userService = ioc.resolve(UserService);
    authService = ioc.resolve(AuthService);

    static async before() { await generateSystemUser(); }

    @test async "Should login correctly" () {
        let token: string;
        try {
            token = await this.authService.login({
                username: "system",
                password: process.env.SYSTEM_PASS
            });
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }

        const system = (await this.userService.find({ username: "system" }))[0];
        expect(token).to.contain("JWT");
        expect(this.authService.decodeToken(token).userId).to.equal(system._id.toString());

        token = null;
        try {
            token = await this.authService.login({
                username: "system@server",
                password: process.env.SYSTEM_PASS
            });
        } catch (err) {
            logger.error(err);
            expect(err).not.to.exist;
        }

        expect(token).to.contain("JWT");
        expect(this.authService.decodeToken(token).userId).to.equal(system._id.toString());
    }

    @test async "Should fail login with wrong credentials" () {
        // Wrong username
        try {
            const wrongToken = await this.authService.login({
                username: "bullshit",
                password: process.env.SYSTEM_PASS
            });
            expect(wrongToken, "I should not get a token from an invalid login!").not.to.exist;
        } catch (err) {
            expect(err).to.exist;
            expect(err.status).to.equal(401);
            expect(err.message).to.equal("Invalid username or password!");
        }

        // Wrong email
        try {
            const wrongToken = await this.authService.login({
                username: "system@server_bullshit",
                password: process.env.SYSTEM_PASS
            });
            expect(wrongToken, "I should not get a token from an invalid login!").not.to.exist;
        } catch (err) {
            expect(err).to.exist;
            expect(err.status).to.equal(401);
            expect(err.message).to.equal("Invalid username or password!");
        }

        // Wrong password
        let wrongToken: string;
        try {
            wrongToken = await this.authService.login({
                username: "system@server",
                password: process.env.SYSTEM_PASS + "I_CC_TP"
            });
        } catch (err) {
            expect(err).to.exist;
            expect(err.status).to.equal(401);
            expect(err.message).to.equal("Invalid username or password!");
        }

        expect(wrongToken, "I should not get a token from an invalid login!").not.to.exist;
    }

    @test async "Should throw error when using an invalid JWT token" () {
        let user;
        try {
            user = await this.authService.getUserByToken("JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NTYzNzc5NzgsInVzZXJJZCI6IjVjOWI5MmYyNzIwYzY1MmFhZDk1NTgwMCJ9.rlJTiTGqwJXar-5Zn1C_NBW78K12H_BXLuti3hBvLAY");
        } catch (err) {
            expect(err).to.exist;
            expect(err.status).to.equal(404);
        }
        expect(user).not.to.exist;

        try {
            user = await this.authService.getUserByToken("JWT YouAreDoneInByTheTimeItsHitYouYourLastSurprise");
        } catch (err) {
            expect(err).to.exist;
            expect(err.status).to.equal(404);
        }
        expect(user).not.to.exist;
    }

    static after() { cleanTestDB(); }

}
