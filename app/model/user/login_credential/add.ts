import {
    UserLoginCredentialSchema,
    UserLoginCredential,
} from "../../../schema/user_login_credentials"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidUserId: "invalid_id",
    InvalidPasswordHash: "invalid_password_hash",
}

type Argument = {
    user_id: UserLoginCredentialSchema["user_id"]
    password_hash: UserLoginCredentialSchema["password_hash"]
}

export const add = async ({
    user_id,
    password_hash,
}: Argument): Promise<UserLoginCredentialSchema> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    if (typeof password_hash !== "string") {
        throw new ModelRuntimeError(ErrorCodes.InvalidPasswordHash)
    }
    return await UserLoginCredential.create({
        user_id,
        password_hash,
    })
}
