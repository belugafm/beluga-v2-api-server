import { FraudScoreSchema } from "../../schema/fraud_score"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as ipqs from "../../lib/ipqs"
import { add } from "./add"
import config from "../../config/app"
import { get } from "./get"

export const ErrorCodes = {
    InvalidIpAddress: "invalid_ip_address",
    ApiRequestFailed: "api_request_failed",
} as const

const fetch_result = async (ip_address: string): Promise<ipqs.IpqsResult> => {
    const existing_result = await get(ip_address)
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

type FraudPreventionRule = (result: ipqs.IpqsResult) => boolean

export const FraudPreventionDefaultRule: FraudPreventionRule = (result) => {
    const { fraud_score, ISP, country_code, proxy, vpn, tor } = result
    if (config.fraud_prevention.isp_allow_list.includes(ISP)) {
        return true
    }
    if (config.fraud_prevention.isp_deny_list.includes(ISP)) {
        return false
    }
    if (fraud_score >= 85) {
        return false
    }
    if (country_code !== "JP") {
        return false
    }
    if (tor === true) {
        return false
    }
    return true
}

export const ok = async (
    ip_address: FraudScoreSchema["ip_address"],
    apply_rule: FraudPreventionRule = FraudPreventionDefaultRule
): Promise<boolean> => {
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    const result = await fetch_result(ip_address)
    console.log(result)

    return apply_rule(result)
}
