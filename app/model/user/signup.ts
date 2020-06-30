import { UserSchema, User, DormantUser } from "../../schema/user"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import * as mongo from "../../lib/mongoose"
import bcrypt from "bcrypt"
import config from "../../config/app"
import mongoose from "mongoose"
import { add as add_login_credential } from "./login_credential/add"
import { add as add_registration_info } from "./registration/add"
import { get as get_registration_info } from "./registration/get"
import { get as get_fraud_score } from "./../fraud_score/get"
import { add as add_fraud_score } from "./../fraud_score/add"
import { FraudScoreSchema } from "app/schema/fraud_score"
import { classify_as_dormant } from "./classify_as_dormant"
import * as ipqs from "../../lib/ipqs"

export const ErrorCodes = {
    InvalidName: "invalid_name",
    InvalidPassword: "invalid_password",
    InvalidIpAddress: "invalid_ip_address",
    InvalidFingerprint: "invalid_fingerprint",
    TooManyRequests: "too_many_requests",
    NameTaken: "name_taken",
}

const generate_fraud_score_if_needed = async (
    ip_address: string
): Promise<FraudScoreSchema | null> => {
    if (config.fraud_prevention.enabled === false) {
        return null
    }
    const existing_fraud_score = await get_fraud_score({ ip_address })
    if (existing_fraud_score) {
        return existing_fraud_score
    }
    const result = await ipqs.get_score(ip_address)
    if (result.success === false) {
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
    if (vs.user_name().ok(name) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidName)
    }
    if (vs.password().ok(password) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidPassword)
    }
    if (vs.ip_address().ok(ip_address) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidIpAddress)
    }
    if (fingerprint) {
        if (
            vs.string({ min_length: 64, max_length: 64 }).ok(fingerprint) !==
            true
        ) {
            throw new ModelRuntimeError(ErrorCodes.InvalidFingerprint)
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
        const existing_user = await mongo.findOne(
            User,
            { name: name },
            (query) => {
                // case insensitiveにする
                query.collation({
                    locale: "en_US",
                    strength: 2,
                })
            }
        )
        if (existing_user) {
            // 既存ユーザーがinactiveな場合swapする
            if (existing_user.needsReclassifyAsDormant() === true) {
                await classify_as_dormant({ user: existing_user })
                existing_user.remove()
            } else {
                throw new ModelRuntimeError(ErrorCodes.NameTaken)
            }
        }

        // @ts-ignore
        const user = await User.create({
            name: name,
            avatar_url: "",
            profile: {},
            stats: {},
            created_at: new Date(),
        })
        const password_hash = await bcrypt.hash(
            password,
            config.user_login_credential.password.salt_rounds
        )
        const credential = await add_login_credential({
            user_id: user._id,
            password_hash,
        })

        const fraud_score = await generate_fraud_score_if_needed(ip_address)
        const fraud_score_id = fraud_score ? fraud_score._id : null
        const registration_info = await add_registration_info({
            user_id: user._id,
            ip_address,
            fraud_score_id,
            fingerprint,
        })

        session.commitTransaction()
        session.endSession()
        return user
    } catch (error) {
        session.abortTransaction()
        session.endSession()
        throw error
    }
}
