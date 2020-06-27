import { FraudScoreSchema, FraudScore } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"

export const ErrorCodes = {
    InvalidIpAddress: "invalid_ip_address",
    InvalidResult: "invalid_result",
} as const

export const add = async (
    ip_address: FraudScoreSchema["ip_address"],
    result: FraudScoreSchema["result"]
): Promise<FraudScoreSchema> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    if (typeof result !== "object") {
        throw new ModelRuntimeError(ErrorCodes.InvalidResult)
    }
    return await FraudScore.create({
        ip_address: ip_address,
        result: result,
        created_at: Date.now(),
    })
}
