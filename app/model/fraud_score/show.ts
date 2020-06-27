import { FraudScoreSchema, FraudScore } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidIpAddress: "invalid_ip_address",
} as const

export const show = async (
    ip_address: FraudScoreSchema["ip_address"]
): Promise<FraudScoreSchema | null> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    return await mongo.findOne(FraudScore, { ip_address: ip_address })
}
