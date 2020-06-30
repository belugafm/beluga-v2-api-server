import {
    UserRegistration,
    UserRegistrationSchema,
} from "../../../schema/user_registration"
import { ModelRuntimeError } from "../../error"
import mongoose from "mongoose"
import * as mongo from "../../../lib/mongoose"
import * as vs from "../../../validation"

export const ErrorCodes = {
    InvalidUserId: "invalid_id",
    InvalidIpAddress: "invalid_ip_address",
    InvalidFraudScoreId: "invalid_fraud_score_id",
    InvalidFingerprint: "invalid_fingerprint",
}

type Argument = {
    user_id?: UserRegistrationSchema["user_id"]
    ip_address?: UserRegistrationSchema["ip_address"]
    fraud_score_id?: UserRegistrationSchema["fraud_score_id"]
    fingerprint?: UserRegistrationSchema["fingerprint"]
    sort_args?: any
}

export const get = async ({
    user_id,
    ip_address,
    fraud_score_id,
    fingerprint,
    sort_args,
}: Argument): Promise<UserRegistrationSchema[]> => {
    const query: Argument = {}
    if (user_id) {
        if (user_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidUserId)
        }
        query.user_id = user_id
    }
    if (ip_address) {
        if (vs.ip_address().ok(ip_address) === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
        }
        query.ip_address = ip_address
    }
    if (fraud_score_id) {
        if (fraud_score_id instanceof mongoose.Types.ObjectId === false) {
            throw new ModelRuntimeError(ErrorCodes.InvalidFraudScoreId)
        }
        query.fraud_score_id = fraud_score_id
    }
    if (fingerprint) {
        if (typeof fingerprint !== "string") {
            throw new ModelRuntimeError(ErrorCodes.InvalidFingerprint)
        }
        query.fingerprint = fingerprint
    }
    return await mongo.find(UserRegistration, query, (query) => {
        return query.sort(sort_args)
    })
}
