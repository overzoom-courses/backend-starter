import { UserDocument } from "@models/UserModel";
import { expect } from "chai";
import { ioc } from "@ioc";
import { AuthService } from "@services/AuthService";
import { UserService } from "@services/UserService";

export function assertSameUser(original: UserDocument, candidate: UserDocument) {
    expect(candidate).to.exist;
    expect(candidate.username).to.equal(original.username);
    expect(candidate.email).to.equal(original.email);
    expect(candidate.password).to.equal(original.password);
    expect(candidate._id.toString()).to.equal(original._id.toString());
}

export async function loginWithSystem(): Promise<string> {
    const authService = ioc.resolve(AuthService);
    return (await authService.login({
        username: "system",
        password: process.env.SYSTEM_PASS
    }));
}

export async function getSystemUser(): Promise<UserDocument> {
    const userService = ioc.resolve(UserService);
    return (await userService.find({
        username: "system"
    }))[0];
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

