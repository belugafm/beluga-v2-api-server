import config from "../config/app"
import fetch from "node-fetch"

export type IpqsResult = {
    success: boolean
    message: string
    fraud_score: number
    country_code: string
    region: string
    city: string
    ISP: string
    ASN: number
    organization: string
    latitude: number
    longitude: number
    is_crawler: boolean
    timezone: string
    mobile: boolean
    host: string
    proxy: boolean
    vpn: boolean
    tor: boolean
    active_vpn: boolean
    active_tor: boolean
    recent_abuse: boolean
    bot_status: boolean
    connection_type: string
    abuse_velocity: string
    request_id: string
}

export const get_score = async (ip_address: string): Promise<IpqsResult> => {
    const url = `https://www.ipqualityscore.com/api/json/ip/${config.fraud_prevention.ipqs_api_secret}/${ip_address}?strictness=1&allow_public_access_points=true&fast=true&lighter_penalties=true`
    const result = await fetch(url)
    return await result.json()
}
