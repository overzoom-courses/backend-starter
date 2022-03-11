import { model, Schema, Document, PaginateModel } from "mongoose";
import { encryptPasswordSync } from "@utils/crypto";
import { array, constant, Decoder, object, oneOf, optional, string } from "@mojotech/json-type-validation";
import uniqueValidator from "mongoose-unique-validator";
import paginate from "mongoose-paginate";

export enum UserRoles {
    ROLE_USER = "ROLE_USER",
    ROLE_ADMIN = "ROLE_ADMIN"
}

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - username
 *       - email
 *       - iva
 *       - phone
 *       - password
 *     properties:
 *       username:
 *         type: string
 *         example: GiovanniOr2
 *       email:
 *         type: string
 *         example: giovanni.orciuolo1999@gmail.com
 *       password:
 *         type: string
 *         example: ciao1234
 *       roles:
 *         type: array
 *         example: [ "ROLE_USER" ]
 *         items:
 *           type: string
 *           enum:
 *             - "ROLE_USER"
 *             - "ROLE_ADMIN"
 *   UserDocument:
 *     allOf:
 *       - $ref: '#/definitions/User'
 *       - type: object
 *         properties:
 *           _id:
 *             type: string
 *             example: 5c991af86327ba47393f2fb3
 *           createdAt:
 *             type: string
 *             example: 2019-03-25T18:16:24.892Z
 *           updatedAt:
 *             type: string
 *             example: 2020-01-02T18:16:24.892Z
 */
export interface User {
    username: string
    email: string
    password: string
    roles?: Array<UserRoles>
    isAdmin?: () => boolean
}
export interface UserDocument extends User, Document {
}
export const userDecoder: Decoder<User> = object({
    username: string(),
    email: string(),
    password: string(),
    roles: optional(array(oneOf(
        constant(UserRoles.ROLE_USER),
        constant(UserRoles.ROLE_ADMIN)
    ))),
});

/**
 * @swagger
 *
 * definitions:
 *   UserPasswordUpdate:
 *     type: object
 *     required:
 *       - currentPassword
 *       - newPassword
 *     properties:
 *       currentPassword:
 *         type: string
 *         example: test
 *       newPassword:
 *         type: string
 *         example: ciao
 */
export interface UserPasswordUpdate {
    currentPassword: string;
    newPassword: string;
}
export const userPasswordUpdateDecoder: Decoder<UserPasswordUpdate> = object({
    currentPassword: string(),
    newPassword: string(),
});

export const UserSchema = new Schema<User>({
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        set: (password: string) => encryptPasswordSync(password),
    },
    roles: {
        type: [ String ],
        enum: [ UserRoles.ROLE_USER, UserRoles.ROLE_ADMIN ],
        default: [ UserRoles.ROLE_USER ]
    },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true,
    }
});

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(paginate);
UserSchema.methods.isAdmin = function() {
    return this.roles.includes(UserRoles.ROLE_ADMIN);
};

export const UserModel = model<UserDocument>("User", UserSchema) as PaginateModel<UserDocument>;
