import { FraudScoreSchema, FraudScore } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import * as ipqs from "../../lib/ipqs"
import { add } from "./add"
import config from "../../config/app"
import { show } from "./show"

export const ErrorCodes = {
    InvalidIpAddress: "invalid_ip_address",
    ApiRequestFailed: "api_request_failed",
} as const

const get_result = async (ip_address: string): Promise<ipqs.IpqsResult> => {
    const existing_result = await show(ip_address)
    if (existing_result) {
        return existing_result.result
    }
    const result = await ipqs.get_score(ip_address)
    if (result.success === false) {
        throw new ModelRuntimeError(ErrorCodes.ApiRequestFailed)
    }
    add(ip_address, result)
    return result
}

export const ok = async (
    ip_address: FraudScoreSchema["ip_address"]
): Promise<boolean> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    const result = await get_result(ip_address)
    console.log(result)

    const { fraud_score, ISP, country_code, proxy, vpn, tor } = result
    if (config.fraud_prevention.isp_allow_list.includes(ISP)) {
        return true
    }
    if (config.fraud_prevention.isp_deny_list.includes(ISP)) {
        return false
    }
    if (fraud_score > 75) {
        return false
    }
    if (country_code !== "JP") {
        // 国外は遮断
        return false
        if (fraud_score >= 65) {
            return true
        }
        if (vpn == true) {
            return true
        }
        if (proxy == true) {
            return true
        }
        if (tor == true) {
            return true
        }
    }
    return true
}
