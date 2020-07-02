import {
    UserLoginCredential,
    UserLoginCredentialSchema,
} from "../../../schema/user_login_credentials"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as mongo from "../../../lib/mongoose"

export const ErrorCodes = {
    InvalidUserId: "invalid_arg_id",
    InvalidIpAddress: "invalid_arg_ip_address",
    InvalidFraudScoreId: "invalid_arg_fraud_score_id",
    InvalidFingerprint: "invalid_arg_fingerprint",
}

type Argument = {
    user_id: UserLoginCredentialSchema["user_id"]
}

export const get = async ({
    user_id,
}: Argument): Promise<UserLoginCredentialSchema | null> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    return await mongo.findOne(UserLoginCredential, { user_id })
}
