// @ts-ignore
import faker from "faker/locale/it";
import { User, UserDocument } from "@models/UserModel";
import { UserService } from "@services/UserService";
import { ioc } from "@ioc";
import { AuthService } from "@services/AuthService";

export function generateMockUser(): User {
    return {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
}

export async function saveMockUserAndLogin(): Promise<{ token: string, user: UserDocument }> {
    const mockUser = generateMockUser();
    const user = await ioc.resolve(UserService).save(mockUser);
    const userToken = await ioc.resolve(AuthService).login({ username: mockUser.email, password: mockUser.password });
    return {
        token: userToken,
        user: user
    };
}

export const userGiovanni: User = {
    username: "GiovanniOr2",
    email: "giovanni.orciuolo1999@gmail.com",
    password: "Expurosion!!!!",
};
