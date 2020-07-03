import {
    UserLoginCredential,
    UserLoginCredentialSchema,
} from "../../../schema/user_login_credentials"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as mongo from "../../../lib/mongoose"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_id",
    InvalidArgIpAddress: "invalid_arg_ip_address",
    InvalidArgFraudScoreId: "invalid_arg_fraud_score_id",
    InvalidArgFingerprint: "invalid_arg_fingerprint",
}

type Argument = {
    user_id: UserLoginCredentialSchema["user_id"]
}

export const get = async ({
    user_id,
}: Argument): Promise<UserLoginCredentialSchema | null> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    return await mongo.findOne(UserLoginCredential, { user_id })
}
