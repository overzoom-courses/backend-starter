import { Error } from "mongoose";
import httpErrors from "http-errors";

export function formatMongoError(error: Error) {
    // I'm not using a switch statement because the linter is convinced that error.name can ONLY be "MongooseError"
    if (error.name === "ValidationError") {
        throw this.formatValidationError(error as Error.ValidationError);
    }
    if (error.name === "DocumentNotFoundError") {
        throw this.formatDocumentNotFoundError(error as Error.DocumentNotFoundError);
    }

    throw new httpErrors.InternalServerError(`${error.name}: ${error.message}`);
}

export function formatValidationError(baseError: Error.ValidationError) {
    return (Object.keys(baseError.errors).every(error => baseError.errors[error].kind === "unique"))
        ? new httpErrors.Conflict(`Expected these parameters to be unique: ${Object.keys(baseError.errors).join(", ")}`)
        : new httpErrors.BadRequest(Object.keys(baseError.errors).map(error => baseError.errors[error].message).join(" "));
}

export function formatDocumentNotFoundError(baseError: Error.DocumentNotFoundError) {
    return new httpErrors.NotFound(baseError.message);
}
