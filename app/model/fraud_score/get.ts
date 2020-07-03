import { FraudScoreSchema, FraudScore } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidArgIpAddress: "invalid_arg_ip_address",
} as const

type Argument = {
    ip_address: FraudScoreSchema["ip_address"]
}

export const get = async ({
    ip_address,
}: Argument): Promise<FraudScoreSchema | null> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIpAddress)
    }
    return await mongo.findOne(FraudScore, { ip_address: ip_address })
}
