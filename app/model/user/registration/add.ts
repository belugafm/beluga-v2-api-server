import {
    UserRegistration,
    UserRegistrationSchema,
} from "../../../schema/user_registration"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"

export const ErrorCodes = {
    InvalidUserId: "invalid_id",
    InvalidIpAddress: "invalid_ip_address",
    InvalidFraudScoreId: "invalid_fraud_score_id",
    InvalidFingerprint: "invalid_fingerprint",
}
import * as vs from "../../../validation"

export const add = async (
    user_id: UserRegistrationSchema["user_id"],
    ip_address: UserRegistrationSchema["ip_address"],
    fraud_score_id: UserRegistrationSchema["fraud_score_id"],
    fingerprint: UserRegistrationSchema["fingerprint"]
): Promise<UserRegistrationSchema> => {
    if (user_id instanceof mongoose.Types.ObjectId === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
    }
    if (vs.ip_address().ok(ip_address) === false) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    if (fraud_score_id) {
        if (fraud_score_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidFraudScoreId)
        }
    }
    if (fingerprint) {
        if (typeof fingerprint !== "string") {
            throw new ModelRuntimeError(ErrorCodes.InvalidFingerprint)
        }
    }
    return await UserRegistration.create({
        user_id,
        ip_address,
        fraud_score_id,
        fingerprint,
    })
}
