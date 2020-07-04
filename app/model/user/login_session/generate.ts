import {
    UserLoginSessionSchema,
    UserLoginSession,
} from "../../../schema/user_login_session"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as vs from "../../../validation"
import bcrypt from "bcrypt"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_id",
    InvalidArgFraudScoreId: "invalid_arg_fraud_score_id",
    InvalidArgIpAddress: "invalid_arg_ip_address",
    InvalidArgPasswordHash: "invalid_arg_password_hash",
    InvalidArgLifetime: "invalid_arg_lifetime",
}

type Argument = {
    user_id: UserLoginSessionSchema["user_id"]
    ip_address: UserLoginSessionSchema["ip_address"]
    fraud_score_id?: UserLoginSessionSchema["fraud_score_id"]
    lifetime: number
}

export const generate = async ({
    user_id,
    ip_address,
    fraud_score_id,
    lifetime,
}: Argument): Promise<UserLoginSessionSchema> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (vs.ip_address().ok(ip_address) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIpAddress)
    }
    if (fraud_score_id) {
        if (fraud_score_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgFraudScoreId)
        }
    }
    if (typeof lifetime !== "number") {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgLifetime)
    }

    const source = {
        ip_address: ip_address,
        date: Date.now(),
        user_id: user_id.toString(),
    }
    const session_token = await bcrypt.hash(JSON.stringify(source), 1)

    return await UserLoginSession.create({
        user_id: user_id,
        created_at: new Date(),
        expire_date: new Date(Date.now() + lifetime * 1000),
        ip_address: ip_address,
        session_token: session_token,
        fraud_score_id: fraud_score_id,
        is_expired: false,
    })
}
