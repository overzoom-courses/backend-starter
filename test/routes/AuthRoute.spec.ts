import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { ioc } from "@ioc";
import { ExpressServer } from "@server";
import { UserService } from "@services/UserService";
import { AuthService } from "@services/AuthService";
import { generateSystemUser } from "@utils/system";
import { cleanTestDB } from "@utils/mongo";
import supertest from "supertest";
import { assertSameUser, getSystemUser } from "../test_utils";
import { logger } from "@utils/winston";

const API = process.env.API_PATH;

@suite("AuthRoute") class AuthRouteTests {

    http = supertest(ioc.resolve(ExpressServer).app);

    userService = ioc.resolve(UserService);
    authService = ioc.resolve(AuthService);

    static async before() { await generateSystemUser(); }

    @test async "Shoud login correctly" () {
        let res = await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "system",
                password: process.env.SYSTEM_PASS
            })
            .expect(200);

        let token: string = res.text;
        expect(token).to.contain("JWT");
        logger.info(token);
        expect(this.authService.decodeToken(token).userId).to.equal((await getSystemUser())._id.toString());

        res = await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "system@server",
                password: process.env.SYSTEM_PASS
            })
            .expect(200);

        token = res.text;
        expect(token).to.contain("JWT");
        expect(this.authService.decodeToken(token).userId).to.equal((await getSystemUser())._id.toString());
    }

    @test async "Should fail login with wrong credentials" () {
        // Wrong username
        await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "bullshit",
                password: process.env.SYSTEM_PASS
            })
            .expect(401);

        // Wrong email
        await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "system@server_bullshit",
                password: process.env.SYSTEM_PASS
            })
            .expect(401);

        // Wrong password
        await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "system@server",
                password: process.env.SYSTEM_PASS + "I_CC_TK"
            })
            .expect(401);
    }

    @test async "Should get correct account by token" () {
        const token: string = (await this.http
            .post(`${API}/auth/login`)
            .send({
                usernameOrEmail: "system",
                password: process.env.SYSTEM_PASS
            })
            .expect(200)
        ).text;

        const { body } = await this.http
            .get(`${API}/auth/me`)
            .set("Authorization", token)
            .expect(200);

        const system = await getSystemUser();
        assertSameUser(system, body);
    }

    @test async "Should not get account with bad tokens" () {
        // JWT made by another app, not pointing to a valid account
        await this.http
            .get(`${API}/auth/me`)
            .set("Authorization", "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NTYzNzc5NzgsInVzZXJJZCI6IjVjOWI5MmYyNzIwYzY1MmFhZDk1NTgwMCJ9.rlJTiTGqwJXar-5Zn1C_NBW78K12H_BXLuti3hBvLAY")
            .expect(401);

        // Invalid JWT (not base64 encoded, without segments)
        await this.http
            .get(`${API}/auth/me`)
            .set("Authorization", "JWT YouActuallyThoughtThatYouCouldGetAwayWithSkeletonInYourCloset,DontThinkSo!")
            .expect(401);

        // No token at all (chad)
        await this.http
            .get(`${API}/auth/me`)
            .expect(401);
    }

    static after() { cleanTestDB(); }

}
