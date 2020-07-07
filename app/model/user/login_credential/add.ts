import {
    UserLoginCredentialSchema,
    UserLoginCredential,
} from "../../../schema/user_login_credentials"
import { ModelRuntimeError } from "../../error"
import mongoose, { ClientSession } from "mongoose"
import { createWithSession } from "../../../lib/mongoose"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_id",
    InvalidArgPasswordHash: "invalid_arg_password_hash",
}

type Argument = {
    user_id: UserLoginCredentialSchema["user_id"]
    password_hash: UserLoginCredentialSchema["password_hash"]
    transaction_session?: ClientSession
}

export const add = async ({
    user_id,
    password_hash,
    transaction_session,
}: Argument): Promise<UserLoginCredentialSchema> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (typeof password_hash !== "string") {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgPasswordHash)
    }
    return await createWithSession(
        UserLoginCredential,
        {
            user_id,
            password_hash,
        },
        transaction_session
    )
}
