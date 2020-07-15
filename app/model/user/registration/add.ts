import {
    UserRegistration,
    UserRegistrationSchema,
} from "../../../schema/user_registration"
import { ModelRuntimeError } from "../../error"
import mongoose, { ClientSession } from "mongoose"

export const ErrorCodes = {
    InvalidArgUserId: "invalid_arg_id",
    InvalidArgIpAddress: "invalid_arg_ip_address",
    InvalidArgFraudScoreId: "invalid_arg_fraud_score_id",
    InvalidArgFingerprint: "invalid_arg_fingerprint",
}
import * as vs from "../../../validation"
import { createWithSession } from "../../../lib/mongoose"

type Argument = {
    user_id: UserRegistrationSchema["user_id"]
    ip_address: UserRegistrationSchema["ip_address"]
    fraud_score_id: UserRegistrationSchema["fraud_score_id"]
    fingerprint: UserRegistrationSchema["fingerprint"]
}

export const add = async (
    { user_id, ip_address, fraud_score_id, fingerprint }: Argument,
    options: {
        transaction_session: ClientSession | null
    } = { transaction_session: null }
): Promise<UserRegistrationSchema> => {
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
    if (fingerprint) {
        if (typeof fingerprint !== "string") {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgFingerprint)
        }
    }
    const date = new Date()
    if (options.transaction_session) {
        return await createWithSession(
            UserRegistration,
            {
                user_id,
                ip_address,
                fraud_score_id,
                fingerprint,
                date,
            },
            options.transaction_session
        )
    } else {
        return await UserRegistration.create({
            user_id,
            ip_address,
            fraud_score_id,
            fingerprint,
            date,
        })
    }
}
