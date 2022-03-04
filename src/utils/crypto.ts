import { hashSync, genSaltSync, compare } from "bcryptjs";

/**
 * Encrypts a given password and returns the encrypted version
 *
 * @param password
 * @returns Encrypted password
 */
export function encryptPasswordSync(password: string): string {
    return hashSync(password, genSaltSync(10));
}

/**
 * Compare passwords
 *
 * @param password
 * @param candidatePassword
 * @returns Promise which resolves to true if the passswords are the same
 */
export async function comparePasswords(password: string, candidatePassword: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        compare(candidatePassword, password, (err, succ) => {
            if (err) return reject(err);
            return resolve(succ);
        });
    });
}
