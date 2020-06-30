import {
    UserLoginSessionSchema,
    UserLoginSession,
} from "../../../schema/user_login_session"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as vs from "../../../validation"
import bcrypt from "bcrypt"

export const ErrorCodes = {
    InvalidUserId: "invalid_id",
    InvalidIpAddress: "invalid_ip_address",
    InvalidPasswordHash: "invalid_password_hash",
    InvalidLifetime: "invalid_lifetime",
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
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    if (vs.ip_address().ok(ip_address) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    if (fraud_score_id) {
        if (fraud_score_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
        }
    }
    if (typeof lifetime !== "number") {
        throw new ModelRuntimeError(ErrorCodes.InvalidLifetime)
    }

    const source = {
        ip_address: ip_address,
        date: Date.now(),
        user_id: user_id.toString(),
    }
    const session_id = await bcrypt.hash(JSON.stringify(source), 1)

    return await UserLoginSession.create({
        user_id: user_id,
        created_at: new Date(),
        expire_date: new Date(Date.now() + lifetime * 1000),
        ip_address: ip_address,
        session_id: session_id,
        fraud_score_id: fraud_score_id,
    })
}
