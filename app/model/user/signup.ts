import { UserSchema, User } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import bcrypt from "bcrypt"
import config from "../../config/app"
import mongoose from "mongoose"
import { add as add_login_credential } from "./login_credential/add"
import { add as add_registration_info } from "./registration/add"
import { get as get_registration_info } from "./registration/get"
import { get as get_fraud_score } from "../fraud_score/get"
import { add as add_fraud_score } from "../fraud_score/add"
import { get as get_user } from "../user/get"
import { agree_to as agree_to_terms_of_service } from "../terms_of_service/agree_to"
import { FraudScoreSchema } from "app/schema/fraud_score"
import { _unsafe_reclassify_as_dormant } from "./reclassify_as_dormant"
import * as ipqs from "../../lib/ipqs"

export const ErrorCodes = {
    InvalidArgName: "invalid_arg_name",
    InvalidArgPassword: "invalid_arg_password",
    InvalidArgIpAddress: "invalid_arg_ip_address",
    InvalidArgFingerprint: "invalid_arg_fingerprint",
    TooManyRequests: "too_many_requests",
    NameTaken: "name_taken",
}

const request_fraud_score_if_needed = async (
    ip_address: string
): Promise<FraudScoreSchema | null> => {
    if (config.fraud_prevention.enabled !== true) {
        return null
    }
    const existing_fraud_score = await get_fraud_score({ ip_address })
    if (existing_fraud_score) {
        return existing_fraud_score
    }
    const result = await ipqs.get_score(ip_address)
    if (result.success !== true) {
        return null
    }
    return add_fraud_score({ ip_address, result })
}

type Argument = {
    name: UserSchema["name"]
    password: string
    ip_address: string
    fingerprint?: string
}

export const signup = async ({
    name,
    password,
    ip_address,
    fingerprint,
}: Argument): Promise<UserSchema> => {
    if (vs.user.name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgPassword)
    }
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgIpAddress)
    }
    if (fingerprint) {
        if (
            vs.string({ min_length: 64, max_length: 64 }).ok(fingerprint) !==
            true
        ) {
            throw new ModelRuntimeError(ErrorCodes.InvalidArgFingerprint)
        }
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        // 同じIPアドレスの場合一定期間は作成禁止
        const existing_registrations = await get_registration_info({
            ip_address: ip_address,
            sort_args: { date: -1 },
        })
        if (existing_registrations.length > 0) {
            const prev_registration = existing_registrations[0]
            const current = new Date()
            const seconds =
                (current.getTime() - prev_registration.date.getTime()) / 1000
            if (seconds < config.user_registration.limit) {
                throw new ModelRuntimeError(ErrorCodes.TooManyRequests)
            }
        }

        // すでに同じ名前のユーザーがいるかどうかを調べる
        const existing_user = await get_user({ name })
        if (existing_user) {
            // 既存ユーザーがinactiveな場合swapする
            if (existing_user.needsReclassifyAsDormant() === true) {
                // existing_userは削除されるので注意
                await _unsafe_reclassify_as_dormant(existing_user)
            } else {
                throw new ModelRuntimeError(ErrorCodes.NameTaken)
            }
        }

        const user = await User.create({
            name: name,
            display_name: null,
            profile: {
                avatar_image_url: "",
                description: null,
                location: null,
                theme_color: null,
                background_image_url: null,
            },
            stats: {
                statuses_count: 0,
            },
            created_at: new Date(),
            is_active: false,
            is_dormant: false,
            last_activity_date: null,
        })
        const password_hash = await bcrypt.hash(
            password,
            config.user_login_credential.password.salt_rounds
        )
        const credential = await add_login_credential({
            user_id: user._id,
            password_hash,
        })

        const fraud_score = await request_fraud_score_if_needed(ip_address)
        const fraud_score_id = fraud_score ? fraud_score._id : undefined
        const registration_info = await add_registration_info({
            user_id: user._id,
            ip_address,
            fraud_score_id,
            fingerprint,
        })

        await agree_to_terms_of_service({
            user_id: user._id,
            date: new Date(),
            version: config.terms_of_service.version,
            session: session,
        })

        await session.commitTransaction()
        session.endSession()
        return user
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}
