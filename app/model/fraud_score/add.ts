import { FraudScoreSchema, FraudScore } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { ClientSession } from "mongoose"
import { createWithSession } from "../../lib/mongoose"

export const ErrorCodes = {
    InvalidArgIpAddress: "invalid_arg_ip_address",
    InvalidArgResult: "invalid_arg_result",
} as const

type Argument = {
    ip_address: FraudScoreSchema["ip_address"]
    result: FraudScoreSchema["result"]
    transaction_session?: ClientSession
}

export const add = async ({
    ip_address,
    result,
    transaction_session,
}: Argument): Promise<FraudScoreSchema> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIpAddress)
    }
    if (typeof result !== "object") {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgResult)
    }
    return await createWithSession(
        FraudScore,
        {
            ip_address: ip_address,
            result: result,
            created_at: new Date(),
        },
        transaction_session
    )
}
